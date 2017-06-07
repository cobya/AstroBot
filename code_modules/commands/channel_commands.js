//------------------------------------------------
// Name: channel_commands.js
// Author: Coby Allred
// Description: Checks chat input to see if it is attempting a channel command. Runs the command if so.
//------------------------------------------------

const db_pool = require("../database/pool");
const async = require("async");
const botUtils = require("../bot_core/bot_utils.js");
const commandParse = require("./command_parser");
const responseParse = require("./response_parser");
const commandUtils = require("./command_utils");

function runChannelCommand(channel, userstate, message, commandInfo, channelID) {
	async.waterfall([
		async.apply(botUtils.getUserID, userstate, channelID),
		async.apply(botUtils.getUserRoleID, userstate),
		async.apply(commandUtils.runCommand, channel, userstate, message, commandInfo)
		], function(err, runResult) {
			if (err) {
				console.error('Error running channel command.', err);
				//runGlobalCommandCallback(err, null);
				return;
			} else {
				console.log(runResult);
				//runGlobalCommandCallback(null, 1);
				return;
			}
		}
	)
	return;
};

function channelCommandQuery(commandOnlyString, channel, userstate, message, channelID, channelCommandQueryCallback) {
	var queryString = `SELECT * FROM public."${channelID}_commands" WHERE "command" = $1`;
	db_pool.query(queryString, [commandOnlyString], function (err, commandInfo) {
		if (err) {
			console.error('Error running channel command query.', err);
			channelCommandQueryCallback(err, 0);
			return;
		} else if (commandInfo.rows.length === 0) {
			// DEBUG PRINT
			console.log('No matching channel command.');
			channelCommandQueryCallback(null, 1);
			return;
		} else {
			// DEBUG PRINT
			console.log(`Matching channel command with ID ${commandInfo.rows[0].command_id}.`);
			runChannelCommand(channel, userstate, message, commandInfo, channelID);
			channelCommandQueryCallback(null, 1);
			return;
		}
	});
};

module.exports = {
	checkIfChannelCommand(channel, userstate, message, wasExecuted) {
		if(message.charAt(0) != "!" || wasExecuted == 1) {
			//checkIfChannelCommandCallback(null, 0);
			return;
		} else {
			if(message.indexOf(' ') >= 0) {
				var commandOnlyString = message.substr(0, message.indexOf(' '));
				var afterCommandString = message.substr(message.indexOf(' ') + 1);
			} else {
				var commandOnlyString = message;
				var afterCommandString = null;
			}
			
			// Queries the database to see if the commandOnlyString matches a valid channel command
			async.waterfall([
				async.apply(botUtils.getChannelID, channel),
				async.apply(channelCommandQuery, commandOnlyString, channel, userstate, message)
			], function (err, runResult) {
				if (err) {
					console.error('Error running channel command.', err);
					//runGlobalCommandCallback(err, null);
					return;
				} else {
					console.log(runResult);
					//runGlobalCommandCallback(null, 1);
					return;
				}
			}
			)
		}

		
	}
};