//------------------------------------------------
// Name: channel_blacklist.js
// Author: Coby Allred
// Description: 
//------------------------------------------------

module.exports = {
	runChannelBlacklist(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, runChannelBlacklistCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID == -1 || hasExecuted == 1){
			runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			// Just returns shit for now
			runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
			return;
		}
	}
};