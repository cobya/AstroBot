//------------------------------------------------
// Name: bot_startup.js
// Author: CanyonCasa, Coby Allred
// Description: Sets up CRON Jobs, continuous chat reading, and checks to webserver to initialize new things
//------------------------------------------------

const dbPool = require("../database/pool");

function exitFunctionality() {
	dbPool.query(`UPDATE public."channels" SET "channel_connected" = 'false'`, [], function (err, commandInfo) {
		if(err){
			console.error(`We're all fucked now`, err);
			return;
		} else {
			// Debug print
			console.log(`All channels have had their connected value set to false`)
			return;
		}
	});
};

exports.Cleanup = function Cleanup(callback) {

	// attach user callback to the process event emitter
	// if no callback, it will still exit gracefully on Ctrl-C
	callback = callback || exitFunctionality;
	process.on('cleanup', callback);

	// do app specific cleaning before exiting
	process.on('exit', function () {
		process.emit('cleanup');
	});

	// catch ctrl+c event and exit normally
	process.on('SIGINT', function () {
		console.log('Ctrl-C...');
		process.exit(2);
 	});

 	//catch uncaught exceptions, trace, then exit normally
	process.on('uncaughtException', function(e) {
		console.log('Uncaught Exception...');
		console.log(e.stack);
	process.exit(99);
	});
};