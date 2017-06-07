//------------------------------------------------
// Name: command_utils.js
// Author: Coby Allred
// Description: Contains a number of functions which are used by both global and channel commands.
//------------------------------------------------

const db_pool = require("../database/pool");
const async = require("async");

module.exports = {

	// How the commands are passed in
	//async.apply(commandUtils.getChannelID, channel),
	//async.apply(commandUtils.getUserID, userstate),
	//commandUtils.getUserRoleID,
	//async.apply(commandUtils.runCommand, channel, userstate, message, commandInfo)


	runCommand(channel, userstate, message, commandInfo, userRoleID, runCommandCallback) {
		// For right now, we will only give the exact command response, without parsing the input or output strings
		global.tmi_client.say(channel, commandInfo.rows[0].command_response);
		runCommandCallback(null, 1);
		return;
	}

};