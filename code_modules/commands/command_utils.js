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
		global.tmi_client.say(channel, commandInfo.rows[0].command_response);
		return;
	},

	// Sets a channel command back to being off of cooldown
	setChannelCommandCooldown(channelID, commandID, setBoolean) {
		var channelCommandCooldownQuery = `UPDATE public."${channelID}_commands" SET "command_on_cooldown" = '${setBoolean}' WHERE "command_id" = ${commandID};`;
		dbPool.query(channelCommandCooldownQuery, [], function (err, channelCommandCooldown) {
			if(err){
				console.error('Error running channel command set on cooldown.', err);
				return;
			}
		});
	},

	// Sets a global command back to being off of cooldown
	setGlobalCommandCooldown(channelID, commandID, setBoolean) {
		var channelGlobalCommandCooldownQuery = `UPDATE public."${channelID}_global_commands_settings" SET "command_on_cooldown" = '${setBoolean}' WHERE "command_id" = ${commandID};`;
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