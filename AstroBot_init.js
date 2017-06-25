//------------------------------------------------
// Name: AstroBot_init.js
// Author: Coby Allred
// Description: Initializes the bot and starts all of the necessary events.
//------------------------------------------------

// Requiring all of the necessary modules for this bot to run.
var tmi = require("tmi.js");
var async = require("async");
var botStartup = require("./code_modules/bot_core/bot_startup");
var botCleanup = require("./code_modules/bot_core/bot_cleanup").Cleanup();

// Creating a global EOL variable
global.endOfLine = require('os').EOL;

// Define global debug values, if "true" then execute debug prints
global.runDebugPrints = false;
global.runConnectionPrints = true;

// Setting the options for the bot's authentication.
var twitch_options = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "",
		password: "oauth:"
	}
};

// Defining how to connect to the Twitch IRC servers.
global.tmi_client = new tmi.client(twitch_options);

// Running the commands which make the bot connect to the server and start doing things
async.waterfall([
	botStartup.connectBot, 
	botStartup.startBotChat, 
	botStartup.startBotEvents, 
	botStartup.startBotCRONJobs
], function (err) {
	if(err) {
		console.error('Error during initial setup of AstroBot.', err);
	} else {
		console.log("----- AstroBot has begun work -----");
	}
});
