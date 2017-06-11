//------------------------------------------------
// Name: global_blacklist.js
// Author: Coby Allred
// Description: Contains the functionality to implement a global blacklist and moderate messages against it
//------------------------------------------------

module.exports = {
	runGlobalBlacklist(channel, userstate, message, channelID, userID, userRoleID, runGlobalBlacklistCallback) {
		// If there is some weird channel database error, don't execute
		if(channelID == -1){
			runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			// Just returns shit for now
			runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
			return;
		}
	}
};