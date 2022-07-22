function requireUser (req, res, next){
    if(!req.user){
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action."
        })
    }
    next()
}

function requireActiveUser (req, res, next){
    try {
       if(!req.user.active){
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action."
        })
    } else {
        next()
    } 
    } catch (error) {
        console.log(error)
    }
}

module.exports = { requireUser, requireActiveUser }