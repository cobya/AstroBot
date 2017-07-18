// Connects to the database using a pool of clients

var pg = require('pg');

var pool = new pg.Pool(global.dbConfig);

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