//------------------------------------------------
// Name: global_commands.js
// Author: Coby Allred
// Description: Checks chat input to see if it is attempting a global command. Runs the command if so.
//------------------------------------------------

const dbPool = require("../database/pool");
const async = require("async");
const botUtils = require("../bot_core/bot_utils.js");
const commandParse = require("./command_parser");
const responseParse = require("./response_parser");
const commandUtils = require("./command_utils");

module.exports = {
	checkGlobalCommand(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, checkGlobalCommandCallback) {
		if(channelID == -1 || message.charAt(0) != "!" || hasExecuted == 1) {
			checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			if(message.indexOf(' ') >= 0) {
				var commandOnlyString = message.substr(0, message.indexOf(' '));
				var afterCommandString = message.substr(message.indexOf(' ') + 1);
			} else {
				var commandOnlyString = message;
				var afterCommandString = null;
			}
			
			// Queries the database to see if the commandOnlyString matches a valid global command
			dbPool.query(`SELECT * FROM public."global_commands" WHERE "command" = $1`, [commandOnlyString], function (err, commandInfo) {
				if(err){
					console.error('Error running global command query.', err);
					checkGlobalCommandCallback(err, channel, userstate, message, channelID, userID, userRoleID, 0);
					return;
				} else if (commandInfo.rows.length === 0) {
					// DEBUG PRINT
					console.log('No matching global command.');
					checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
					return;
				} else {
					// DEBUG PRINT
					console.log(`Matching global command with ID ${commandInfo.rows[0].command_id}.`);
					commandUtils.runCommand(channel, userstate, message, commandInfo);
					checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
					return;
				}
			});
		}

		
	}
};