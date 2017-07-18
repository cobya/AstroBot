//------------------------------------------------
// Name: caps_spam.js
// Author: Coby Allred
// Description: Checks for messages with an excessive amount of capital letters
//------------------------------------------------

module.exports = {
	capsModeration(channel, userstate, message, channelID, userID, userRoleID, channelSettings, hasExecuted, capsModerationCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			capsModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			// Just returns shit for now
			capsModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
			return;
		}
	}
};