const { client, getAllUsers } = require('./index');

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
                password varchar(255) NOT NULL
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
    } catch(error) {
        throw error
    } 
} 

async function testDB(){
    try {
        console.log('starting to test database');

        const users = await getAllUsers();

        console.log('getAllUsers:', users);

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
