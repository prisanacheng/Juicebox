const { client, getAllUsers, createUser, updateUser, getUserById, createPost, updatePost, getAllPosts, getPostsByUser, createPostTag, createTags, addTagsToPost, getPostById, getPostsByTagName } = require('./index');

async function createInitialUsers (){
    try {
        console.log("starting to create users...")
        const albert = await createUser({username: 'albert', password: 'bertie99', name: 'Al Bert', location:'Sidney, Australia'})
        const sandra = await createUser({username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't Tellin'"})
        const glamgal = await createUser({username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'})
     
        console.log("finished creating users")
    } catch(error){
        console.error("error creating users")
        throw error;
    }
}

async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      console.log("Starting to create posts...");
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      });
  
      await createPost({
        authorId: sandra.id,
        title: "How does this work?",
        content: "Seriously, does this even do anything?",
        tags: ["#happy", "#worst-day-ever"]
      });
  
      await createPost({
        authorId: glamgal.id,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing.",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });
      console.log("Finished creating posts!");
    } catch (error) {
      console.log("Error creating posts!");
      throw error;
    }
  }

async function dropTables() {
    try {
        console.log('starting to drop tables...')

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        console.log('finished dropping tables')
    } catch(error) {
        console.error('error dropping tables')
        throw error;
    }
}

async function createTables() {
    try {
        console.log('starting to build tables...')

        await client.query(`
            CREATE TABLE users(
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts(
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title varchar(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true           
            );
            CREATE TABLE tags(
                id SERIAL PRIMARY KEY,
                name varchar(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags(
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id), 
                UNIQUE ("postId", "tagId")
            );
        `);
        console.log('finished building table')
    } catch(error) {
        console.error('error building table')
        throw error;
    }
} 

async function rebuildDB(){
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        await createInitialTags();
    } catch(error) {
        throw error
    } 
} 

async function testDB(){
    try {
        console.log('starting to test database');

        console.log('calling getAllUsers')
        const users = await getAllUsers();
        console.log('result:', users);

        console.log('calling updateUser on users[0]')
        const updateUserResult = await updateUser(users[0].id, {
            name: 'Newname Sogood',
            location: 'Lesterville, KY'
        });
        console.log('Result:', updateUserResult)

        console.log('calling getAllPosts')
        const posts = await getAllPosts();
        console.log("result:", posts)

        console.log("calling getUserById with 1")
        const albert = await getUserById(1)
        console.log("result:", albert)

        console.log("calling updatePost on posts[0]")
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        })
        console.log("result:", updatePostResult)

        console.log("calling updatePost on posts[1], only updating tags")
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#youcandoanything", "#redfish", "#bluefish"]
        })
        console.log("Result:", updatePostTagsResult)

        console.log("calling getPostsByTagName with #happy")
        const postsWithHappy = await getPostsByTagName("#happy")
        console.log("Result:", postsWithHappy)

        console.log('finished database test');
    } catch(error) {
        console.error('error testing database')
        throw error;
    }
}

async function createInitialTags(){
    try{
        console.log("starting to create tags...")

        const [happy, sad, inspo, catman] = await createTags([
            "#happy", 
            "#worst-day-ever",
            "#youcandoanything",
            "#catmandoeverything"
        ])
        const [postOne, postTwo, postThree] = await getAllPosts()

        await addTagsToPost(postOne.id, [happy,inspo])
        await addTagsToPost(postTwo.id, [sad, inspo])
        await addTagsToPost(postThree.id, [happy, catman, inspo])
        console.log("finished creating tags")
    } catch(error){
        console.log("error creating tags")
        throw error
    }
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(()=> client.end());
