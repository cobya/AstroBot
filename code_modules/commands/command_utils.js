//------------------------------------------------
// Name: command_utils.js
// Author: Coby Allred
// Description: Contains a number of functions which are used by both global and channel commands.
//------------------------------------------------

var dbPool = require("../database/pool");
var async = require("async");

module.exports = {
	// For right now, runCommand will only give the exact command response, without parsing the input or output strings
	runCommand(channel, userstate, message, commandInfo, userRoleID) {
		global.tmi_client.say(channel, commandInfo.rows[0].commandResponse);
		return;
	},

	// Sets a channel command back to being off of cooldown
	setChannelCommandCooldown(channelID, commandID, setBoolean) {
		var channelCommandCooldownQuery = `UPDATE public."channelCommands" SET "commandOnCooldown" = '${setBoolean}' WHERE "commandID" = ${commandID};`;
		dbPool.query(channelCommandCooldownQuery, [], function (err, channelCommandCooldown) {
			if(err){
				console.error('Error running channel command set on cooldown.', err);
				return;
			}
		});
	},

	// Sets a global command back to being off of cooldown
	setGlobalCommandCooldown(channelID, commandID, setBoolean) {
		var channelGlobalCommandCooldownQuery = `UPDATE public."channelGlobalCommandSettings" SET "commandOnCooldown" = '${setBoolean}' WHERE "commandID" = ${commandID};`;
		dbPool.query(channelGlobalCommandCooldownQuery, [], function (err, channelGlobalCommandCooldown) {
			if(err){
				console.error('Error running global command set on cooldown.', err);
				return;
			}
		});
	},

	// Parses the arguments of any command being run
	parseCommandInput() {

	},

	// Parses the output of a command to run certain special functions
	parseCommandOutput() {

	}
};