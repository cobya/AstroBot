//------------------------------------------------
// Name: emote_spam.js
// Author: Coby Allred
// Description: Moderates excessive usage of emotes within chat
//------------------------------------------------

module.exports = {
	emoteModeration(channel, userstate, message, channelID, userID, userRoleID, channelSettings, hasExecuted, emoteModerationCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			emoteModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			// Just returns shit for now
			emoteModerationCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
			return;
		}
	}
};