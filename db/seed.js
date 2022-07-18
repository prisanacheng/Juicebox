const { client, getAllUsers, createUser, updateUser, getUserById, createPost, updatePost, getAllPosts, getPostsByUser } = require('./index');

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

async function createInitialPosts(){
    try{
        const [albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them."
        })
        await createPost({
            authorId: sandra.id,
            title: "how does this work?",
            content: "seriously? does this even do anything?"
        })
        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posing!!!!!!"
        })
        console.log("finished creating posts")
    } catch(error){
        console.log("error creating posts")
        throw error
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
                "tagsId" INTEGER REFERENCES tags(id), 
                UNIQUE ("postId", "tagsId")
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

        console.log("calling updatePost on posts[0]")
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        })
        console.log("result:", updatePostResult)

        console.log("calling getUserById with 1")
        const albert = await getUserById(1)
        console.log("result:", albert)

        console.log('finished database test');
    } catch(error) {
        console.error('error testing database')
        throw error;
    }
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(()=> client.end());
