//------------------------------------------------
// Name: AstroBot_init.js
// Author: Coby Allred
// Description: Initializes the bot and starts all of the necessary events.
//------------------------------------------------

// Makes sure the database pool config is valid before proceeding
function checkDBConfig(checkDBConfigCallback) {
	if(typeof global.dbConfig == 'undefined') {
		setTimeout(checkPoolConfig, 50);
		return;
	} else {
		checkDBConfigCallback(null, "valid database config");
		console.log("valid config");
		return;
	}
}

// Starts the bot's core functionality
function startBot(checkPoolConfigCallback, startBotCallback) {
	// Running the commands which make the bot connect to the server and start doing things
	var botStartup = require("./code_modules/bot_core/bot_startup");
	var botCleanup = require("./code_modules/bot_core/bot_cleanup").Cleanup();

	async.waterfall([
		botStartup.connectBot, 
		botStartup.startBotChat, 
		botStartup.startBotEvents, 
		botStartup.startBotCRONJobs
	], function (err) {
		if(err) {
			startBotCallback(err, "error");
			return;
		} else {
			startBotCallback(null, "complete");
			return;
		}
	});
}

// Requiring all of the necessary modules for this bot to run.
var tmi = require("tmi.js");
var async = require("async");
var twitchOptions = require("./AstroBot_credentials").twitchOptions;
global.dbConfig = require("./AstroBot_credentials").dbConfig;

// Creating a global EOL variable
global.endOfLine = require('os').EOL;

// Define global debug values, if "true" then execute debug prints
global.runDebugPrints = false;
global.runConnectionPrints = true;

// Defining how to connect to the Twitch IRC servers.
global.tmi_client = new tmi.client(twitchOptions);

// Checks the DB config, then starts the bot
async.waterfall([
	checkDBConfig,
	startBot
	], function (err) {
		if(err) {
			console.error('Error during initial setup of AstroBot.', err);
			return;
		} else {
			console.log("----- AstroBot has begun work -----");
			return;
		}
	}
);