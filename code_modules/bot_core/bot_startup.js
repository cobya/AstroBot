// Sets up CRON Jobs, continuous chat reading, and checks to webserver to initialize new things
const channelConnect = require("../channels/channel_connect");
const subAlerts = require("../alerts/sub_alert");
const bitAlerts = require("../alerts/bits_alert");
const db_pool = require("../database/pool");
const CronJob = require('cron').CronJob;
const async = require("async");

function connectToServer(connectToServerCallback) {
	global.tmi_client.connect();
	global.tmi_client.on('connected', function(address, port) {
		console.log("Address: " + address + " Port: " + port + global.endOfLine);
	});

	connectToServerCallback(null, "connected");
};

module.exports = {
	// Connect to the Twitch IRC servers and the channels already defined in the DB
	connectBot(connectBotCallback) {
		async.waterfall([connectToServer, channelConnect.readChannels, channelConnect.connectToStartupChannels], function(err) {
			if(err) {
				connectBotCallback(err, null);
				console.error('Error during initial connections of AstroBot.', error);
			} else {
				connectBotCallback(null, "connected");
				console.log("Successful initial connections.");
			}
		});
	},

	// Starts reading all chat messages
	startBotChat(connectCallbackResult, startBotChatCallback){
		global.tmi_client.on("message", function (channel, userstate, message, self) {
			// Don't listen to bot messages
			if (self) {
				return;
			} 

			// Since there are three possible message types, filter them based off of things.
			switch(userstate["message-type"]) {
				// In the case of any messages in chat, check them
				case "action":
				case "chat":
					// Pass the chat to the various modules
			
					// pass to global blacklist
					// pass to channel blacklist
					// pass through channel moderation filters
					// pass to global commands list
					// pass through channel command list

					break;

				// In the case of whispers, just send them a message saying you're a bot.
				case "whisper":
					global.tmi_client.whisper(userstate.username, "Sorry, but you've whispered a bot! I can't respond to you, but if you have a question about the bot or the bot is experiencing a problem, contact us at https://twitter.com/ItsAstroBot");
					break;

				// If the API breaks, try and filter it like chat
				default:
					// do the same as chat? shouldn't happen, but still
					break;
			}
		});

		startBotChatCallback(null, "reading messages");
	},

	// Starts reading all event messages
	startBotEvents(startBotChatCallbackResult, startBotEventsCallback){
		global.tmi_client.on("subscription", function (channel, username, method, message, userstate) {
			var time = new Date();
			var timeString = time.getHours() + ":" + time.getMinutes();

			console.log(`[${timeString}] ${username} subscribed on ${channel} with the message "${message}"`);
			subAlerts.subAlert(channel, username);
		});

		global.tmi_client.on("resub", function (channel, username, months, message, userstate, methods) {
			var time = new Date();
			var timeString = time.getHours() + ":" + time.getMinutes();

			console.log(`[${timeString}] ${username} resubbed for ${months} months on ${channel} with the message "${message}"`);
			subAlerts.resubAlert(channel, username);
		});

		global.tmi_client.on("cheer", function (channel, userstate, message) {
			var time = new Date();
			var timeString = time.getHours() + ":" + time.getMinutes();

			console.log(`[${timeString}] ${userstate.username} cheered ${userstate.bits} on ${channel} with the message "${message}"`);
			bitAlerts.bitAlert(channel, userstate);
		});

		startBotEventsCallback(null, "logging events");
	}, 

	// Starts any channel specific timers
	startBotCRONJobs(startBotEventsCallbackResult, startBotCRONJobsCallback) {
		startBotCRONJobsCallback(null, "CRONs have begun");
	}
};