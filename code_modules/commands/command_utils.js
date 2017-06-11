//------------------------------------------------
// Name: command_utils.js
// Author: Coby Allred
// Description: Contains a number of functions which are used by both global and channel commands.
//------------------------------------------------

const dbPool = require("../database/pool");
const async = require("async");

module.exports = {
	runCommand(channel, userstate, message, commandInfo, userRoleID) {
		// For right now, we will only give the exact command response, without parsing the input or output strings
		global.tmi_client.say(channel, commandInfo.rows[0].command_response);
		return;
	}
};