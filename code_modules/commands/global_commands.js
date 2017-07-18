//------------------------------------------------
// Name: globalCommands.js
// Author: Coby Allred
// Description: Checks chat input to see if it is attempting a global command. Runs the command if so.
//------------------------------------------------

var dbPool = require("../database/pool");
var async = require("async");
var botUtils = require("../bot_core/bot_utils.js");
var commandUtils = require("./command_utils");

module.exports = {
	// Checks a message to see if a global command was called
	checkGlobalCommand(channel, userstate, message, channelID, userID, userRoleID, channelSettings, hasExecuted, checkGlobalCommandCallback) {
		// If there is a weird error, just don't try
		if(channelID === -1 || message.charAt(0) != "!" || hasExecuted === 1) {
			checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			// Return the command only
			if(message.indexOf(' ') >= 0) {
				var commandOnlyString = message.substr(0, message.indexOf(' '));
				var afterCommandString = message.substr(message.indexOf(' ') + 1);
			} else {
				var commandOnlyString = message;
				var afterCommandString = null;
			}
			
			// Queries the database to see if the commandOnlyString matches a valid global command
			dbPool.query(`SELECT * FROM public."globalCommands" WHERE "commandText" = $1`, [commandOnlyString], function (err, commandInfo) {
				if(err){
					console.error('Error running global command query.', err);
					checkGlobalCommandCallback(err, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
					return;
				} else if (commandInfo.rows.length === 0) {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log('No matching global command.');
					}
					
					checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
					return;
				} else {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Matching global command with ID ${commandInfo.rows[0].commandID}.`);
					}
					
					// Get the channel specific global command parameters and begin command execution
					dbPool.query(`SELECT * FROM public."channelGlobalCommandSettings" WHERE "channelUserID" = ${channelID}`, [], function (err, channelGlobalCommandSettings) {
						if(err){
							console.error('Error running channel command set on cooldown.', err);
							checkGlobalCommandCallback(err, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
							return;
						// If the user can run the command, run it
						} else if (channelGlobalCommandSettings.rows[0].commandEnabled === true && channelGlobalCommandSettings.rows[0].commandOnCooldown === false && channelGlobalCommandSettings.rows[0].commandRequiredRoleID <= userRoleID) {
							commandUtils.runCommand(channel, userstate, message, commandInfo, userRoleID); // Run the command
							commandUtils.setGlobalCommandCooldown(channelID, commandInfo.rows[0].commandID, true); // Set the command to be on cooldown

							setTimeout(function() { // Call a timer to set the command to be off cooldown after its specified time
								commandUtils.setGlobalCommandCooldown(channelID, commandInfo.rows[0].commandID, false);
							}, channelGlobalCommandSettings.rows[0].commandCooldown * 1000);

							checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
							return;
						} else {
							checkGlobalCommandCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
							return;
						}
					});
				}
			});
		}
	}
};