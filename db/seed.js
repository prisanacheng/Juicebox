const { client, getAllUsers, createUser, updateUser } = require('./index');

async function createInitialUsers (){
    try {
        console.log("starting to create users...")
        const albert = await createUser({username: 'albert', password: 'bertie99', name: 'Al Bert', location:'Sidney, Australia'})
        const sandra = await createUser({username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't Tellin'"})
        const glamgal = await createUser({username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side'})
        console.log(albert)
        console.log(sandra)
        console.log(glamgal)
       

        console.log("finished creating users")
    } catch(error){
        console.error("error creating users")
        throw error;
    }
}

async function dropTables() {
    try {
        console.log('starting to drop tables...')

        await client.query(`
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
