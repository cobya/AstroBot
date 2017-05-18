// Connects to the database using a pool of clients

const pg = require('pg');

var db_config = {
	user: '', //env var: PGUSER 
	database: '', //env var: PGDATABASE 
	password: '', //env var: PGPASSWORD 
	host: '', // Server hosting the postgres database 
	ssl: true, // force SSL
	port: 5432, //env var: PGPORT 
	max: 10, // max number of clients in the pool 
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};

const pool = new pg.Pool(db_config);

pool.on('error', function (err, client) {
	// if an error is encountered by a client while it sits idle in the pool 
	// the pool itself will emit an error event with both the error and 
	// the client which emitted the original error 
	// this is a rare occurrence but can happen if there is a network partition 
	// between your application and the database, the database restarts, etc. 
	// and so you might want to handle it and at least log it out 
	console.error('Idle client error.', err.message, err.stack);
});

module.exports.query = function (text, values, callback) {
	console.log('query:', text, values);
	return pool.query(text, values, callback);
};

module.exports.connect = function (callback) {
	return pool.connect(callback);
};