//------------------------------------------------
// Name: bot_startup.js
// Author: Coby Allred
// Description: Sets up CRON Jobs, continuous chat reading, and checks to webserver to initialize new things
//------------------------------------------------

// Including all of the necessary modules for the bot to run
const CronJob = require("cron").CronJob;
const async = require("async");
const addZero = require("add-zero");
const channelConnect = require("../channels/channel_connect");
const botUtils = require("./bot_utils");
const dbPool = require("../database/pool");

// Including the moderation code modules
const globalBlacklist = require("../moderation/global_blacklist");
const channelBlacklist = require("../moderation/channel_blacklist");
const linkModeration = require("../moderation/manage_links");
const copypastaModeration = require("../moderation/copypasta_spam");
const emoteModeration = require("../moderation/emote_spam");
const repeatedModeration = require("../moderation/repeated_words_spam");
const capsModeration = require("../moderation/caps_spam");
const symbolModeration = require("../moderation/symbol_spam");

// Including the commands and alert modules
const globalCommands = require("../commands/global_commands");
const channelCommands = require("../commands/channel_commands");
const subAlerts = require("../alerts/sub_alert");
const bitAlerts = require("../alerts/bits_alert");

// Creates a time string with the format HH:MM:SS
function createTimeString() {
	var time = new Date();
	var timeString = addZero(time.getHours()) + ":" + addZero(time.getMinutes()) + ":" + addZero(time.getSeconds());

	return timeString;
};

// Connects to the Twitch IRC server and begins logging connection information
function connectToServer(connectToServerCallback) {
	global.tmi_client.connect();
	global.tmi_client.on('connected', function(address, port) {
		console.log("Address: " + address + " Port: " + port + global.endOfLine);
		connectToServerCallback(null, "connected");
	});

	// Upon receiving a ping from the Twitch server, log it
	global.tmi_client.on("ping", function () {
    	var timeString = createTimeString();

		if (global.runConnectionPrints == true) {
			console.log(`[${timeString}] Received PING from Twitch servers`);
		}
	});

	// Upon sending a response to the Twitch server, log it
	global.tmi_client.on("pong", function (latency) {
		var timeString = createTimeString();

		if (global.runConnectionPrints == true) {
			console.log(`[${timeString}] Sent a PONG to Twitch servers with a latency of ${latency}s`);
		}
		
	});

};

module.exports = {
	// Connect to the Twitch IRC servers and the channels already defined in the DB
	connectBot(connectBotCallback) {
		async.waterfall([
			connectToServer, 
			channelConnect.readAllChannels, 
			channelConnect.connectToAllChannels,
			], function(err) {
			if(err) {
				connectBotCallback(err, null);
				console.error('Error during initial connections of AstroBot.', err);
			} else {
				connectBotCallback(null, "connected");

				if (global.runDebugPrints == true) {
					console.log("Successful initial connections.");
				}
				
			}
		});
	},

	// Starts reading all chat messages
	startBotChat(connectCallbackResult, startBotChatCallback){
		global.tmi_client.on("message", function (channel, userstate, message, self) {
			// Don't listen to bot's own messages
			if (self) {
				return;
			} 

			// Since there are three possible message types, filter them based off of things.
			switch(userstate["message-type"]) {
				// In the case of any messages in chat, check them
				case "action":
				case "chat":
					async.waterfall([
						async.apply(botUtils.getChannelID, channel, userstate, message),
						botUtils.getUserID,
						botUtils.getUserRoleID,
						globalBlacklist.runGlobalBlacklist,
						channelBlacklist.runChannelBlacklist,
						linkModeration.manageLinks,
						copypastaModeration.copypastaModeration,
						emoteModeration.emoteModeration,
						repeatedModeration.repeatedModeration,
						capsModeration.capsModeration,
						symbolModeration.symbolModeration,
						globalCommands.checkGlobalCommand,
						channelCommands.checkChannelCommand
					], function (err) {
						if(err) {
							console.error('Error during message checking.', err);
						} else {
							// DEBUG PRINT
							if (global.runDebugPrints == true) {
								console.log("Message checked.");
							}
						}
					});
					break;

				// In the case of whispers, just send them a message saying you're a bot.
				case "whisper":
					global.tmi_client.whisper(userstate.username, "Sorry, but you've whispered a bot! I can't respond to you, but if you have a question about the bot or the bot is experiencing a problem, contact us at https://twitter.com/ItsAstroBot");
					break;

				// If the API breaks, try and filter it like chat
				default:
					// do the same as chat? shouldn't happen, but still
					async.waterfall([
						async.apply(botUtils.getChannelID, channel, userstate, message),
						botUtils.getUserID,
						botUtils.getUserRoleID,
						globalBlacklist.runGlobalBlacklist,
						channelBlacklist.runChannelBlacklist,
						linkModeration.manageLinks,
						copypastaModeration.copypastaModeration,
						emoteModeration.emoteModeration,
						repeatedModeration.repeatedModeration,
						capsModeration.capsModeration,
						symbolModeration.symbolModeration,
						globalCommands.checkGlobalCommand,
						channelCommands.checkChannelCommand
					], function (err) {
						if(err) {
							console.error('Error during message checking.', err);
						} else {
							if (global.runDebugPrints == true) {
								console.log("Message checked.");
							}
						}
					});
					break;
			}
		});

		startBotChatCallback(null, "reading messages");
	},

	// Starts reading all event messages
	startBotEvents(startBotChatCallbackResult, startBotEventsCallback){
		global.tmi_client.on("subscription", function (channel, username, method, message, userstate) {
			var timeString = createTimeString();

			// DEBUG PRINT
			if (global.runDebugPrints == true) {
				console.log(`[${timeString}] ${username} subscribed on ${channel} with the message "${message}"`);
			}
			
			subAlerts.subAlert(channel, username);
		});

		global.tmi_client.on("resub", function (channel, username, months, message, userstate, methods) {
			var timeString = createTimeString();

			// DEBUG PRINT
			if (global.runDebugPrints == true) {
				console.log(`[${timeString}] ${username} resubbed for ${months} months on ${channel} with the message "${message}"`);
			}
			
			subAlerts.resubAlert(channel, username);
		});

		global.tmi_client.on("cheer", function (channel, userstate, message) {
			var timeString = createTimeString();

			// DEBUG PRINT
			if (global.runDebugPrints == true) {
				console.log(`[${timeString}] ${userstate.username} cheered ${userstate.bits} on ${channel} with the message "${message}"`);
			}

			bitAlerts.bitAlert(channel, userstate);
		});

		startBotEventsCallback(null, "logging channel events");
	}, 

	// Starts any channel specific timers
	startBotCRONJobs(startBotEventsCallbackResult, startBotCRONJobsCallback) {
		startBotCRONJobsCallback(null, "CRONs have begun");
	}
};