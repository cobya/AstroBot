const pool = require('./pool');

//ask for a client from the pool 
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  
  //use the client for executing the query 
  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error) 
    done(err);
 
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].number);
    //output: 1 
  });
});