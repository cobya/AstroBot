//------------------------------------------------
// Name: channel_commands.js
// Author: Coby Allred
// Description: Checks chat input to see if it is attempting a channel command. Runs the command if so.
//------------------------------------------------

var dbPool = require("../database/pool");
var async = require("async");
var botUtils = require("../bot_core/bot_utils.js");
var commandUtils = require("./command_utils");

module.exports = {
	checkChannelCommand(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, checkChannelCommandCallback) {
		if(channelID === -1 || message.charAt(0) != "!" || hasExecuted === 1) {
			checkChannelCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			if(message.indexOf(' ') >= 0) {
				var commandOnlyString = message.substr(0, message.indexOf(' '));
				var afterCommandString = message.substr(message.indexOf(' ') + 1);
			} else {
				// ELSE SEND TO COMMAND PARSE, TO DO
				var commandOnlyString = message;
				var afterCommandString = null;
			}
			
			// Queries the database to see if the commandOnlyString matches a valid channel command
			dbPool.query(`SELECT * FROM public."${channelID}_commands" WHERE "command" = $1`, [commandOnlyString], function (err, commandInfo) {
				// If error, exit
				if (err) {
					console.error('Error running channel command query.', err);
					checkChannelCommandCallback(err, channel, userstate, message, channelID, userID, userRoleID, 0);
					return;
				// Else if no commands, return
				} else if (commandInfo.rows.length === 0) {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log('No matching channel command.');
					}
					
					checkChannelCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
					return;
				// If command found, run it and return
				} else {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Matching channel command with ID ${commandInfo.rows[0].command_id}.`);
					}
					
					// Check to make sure the user can run the command and run it, else say executed and return
					if (commandInfo.rows[0].command_enabled === true && commandInfo.rows[0].command_on_cooldown === false && commandInfo.rows[0].command_required_role_id >= userRoleID) {

						commandUtils.runCommand(channel, userstate, message, commandInfo, userRoleID); // Run the command
						commandUtils.setChannelCommandCooldown(channelID, commandInfo.rows[0].command_id, true); // Set the command to be on cooldown
						setTimeout(function() { // Call a timer to set the command to be off cooldown after its specified time
								commandUtils.setChannelCommandCooldown(channelID, commandInfo.rows[0].command_id, false);
							}, commandInfo.rows[0].command_cooldown * 1000);

						checkChannelCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
						return;
					} else {
						checkChannelCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
						return;
					}
					
				}
			});
		}

		
	}
};