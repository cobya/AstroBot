//------------------------------------------------
// Name: command_utils.js
// Author: Coby Allred
// Description: Contains a number of functions which are used by both global and channel commands.
//------------------------------------------------

const dbPool = require("../database/pool");
const async = require("async");

module.exports = {
	// For right now, runCommand will only give the exact command response, without parsing the input or output strings
	runCommand(channel, userstate, message, commandInfo, userRoleID) {
		global.tmi_client.say(channel, commandInfo.rows[0].command_response);
		return;
	},

	// Parses the arguments of any command being run
	parseCommandInput() {

	},

	// Parses the output of a command to run certain special functions
	parseCommandOutput() {

	}
};