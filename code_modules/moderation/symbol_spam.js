//------------------------------------------------
// Name: symbol_spam.js
// Author: Coby Allred
// Description: Checks for messages containing an excessive amount of symbols
//------------------------------------------------

module.exports = {
	symbolModeration(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, symbolModerationCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			symbolModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			// Just returns shit for now
			symbolModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
			return;
		}
	}
};