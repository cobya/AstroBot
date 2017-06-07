//------------------------------------------------
// Name: AstroBot_init.js
// Author: Coby Allred
// Description: Initializes the bot and starts all of the necessary events.
//------------------------------------------------

// Requiring all of the necessary modules for this bot to run.
const tmi = require("tmi.js");
const pg = require('pg');
const async = require("async");
const botStartup = require("./code_modules/bot_core/bot_startup");

// Creating a global EOL variable
global.endOfLine = require('os').EOL;

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
async.waterfall([botStartup.connectBot, botStartup.startBotChat, botStartup.startBotEvents, botStartup.startBotCRONJobs], function (err) {
	if(err) {
		console.error('Error during initial setup of AstroBot.', err);
	} else {
		console.log("Initial setup has been completed.");
	}
});

