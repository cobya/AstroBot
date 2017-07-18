//------------------------------------------------
// Name: copypasta_spam.js
// Author: Coby Allred
// Description: Moderates excessive copypasta spam within chat
//------------------------------------------------

module.exports = {
	copypastaModeration(channel, userstate, message, channelID, userID, userRoleID, channelSettings, hasExecuted, copypastaModerationCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			copypastaModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			// Just returns shit for now
			copypastaModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
			return;
		}
	}
};