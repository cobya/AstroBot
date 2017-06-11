//------------------------------------------------
// Name: repeated_words_spam.js
// Author: Coby Allred
// Description: Moderates low effort chat with a large amount of repeated words
//------------------------------------------------

module.exports = {
	repeatedModeration(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, repeatedModerationCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID == -1 || hasExecuted == 1){
			repeatedModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			// Just returns shit for now
			repeatedModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
			return;
		}
	}
};