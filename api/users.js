const express = require("express");
const usersRouter = express.Router();
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require("../db");
const { requireUser, requireActiveUser } = require("./utils");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

usersRouter.use((req, res, next) => {
  console.log("a request is being made to /users");

  next();
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1w" }
      );
      res.send({ message: "You're logged in", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;
  try {
    const _user = await getUserByUsername(username);
    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }
    const user = await createUser({
      username,
      password,
      name,
      location,
    });
    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );
    res.send({
      message: "Thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);

    if ((user.id == req.user.id) && user.active) {
      const updatedUser = await updateUser(user.id, { active: false });

      res.send({ user: updatedUser });
    } else {
      next(
        user.active
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a user which is not yours",
            }
          : {
              name: "UserNotFoundError",
              message: "That user does not exist",
            }
      );
    }
  } catch ({ name, message }) {
        next({ name, message })
    }
});

usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
    try {
      const user = await getUserById(req.params.userId);
  
      if ((user.id == req.user.id) && !user.active) {
        const updatedUser = await updateUser(user.id, { active: true });
  
        res.send({ user: updatedUser });
      } else {
        next(
          !user.active
            ? {
                name: "UnauthorizedUserError",
                message: "You cannot update a user which is not yours",
              }
            : {
                name: "UserAlreadyActivatedError",
                message: "That user has already been activated",
              }
        );
      }
    } catch ({ name, message }) {
          next({ name, message })
      }
  });


module.exports = usersRouter;
