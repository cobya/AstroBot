//------------------------------------------------
// Name: manage_links.js
// Author: Coby Allred
// Description: Manages links within a channel's chat including link timeout, blacklist, and whitelist
//------------------------------------------------

module.exports = {
	manageLinks(channel, userstate, message, channelID, userID, userRoleID, hasExecuted, manageLinksCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			manageLinksCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			// Just returns shit for now
			manageLinksCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
			return;
		}
	}
};