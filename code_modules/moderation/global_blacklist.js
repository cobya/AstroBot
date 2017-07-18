//------------------------------------------------
// Name: global_blacklist.js
// Author: Coby Allred
// Description: Contains the functionality to implement a global blacklist and moderate messages against it
//------------------------------------------------

var dbPool = require("../database/pool");
var modUtils = require("./moderation_utils");

module.exports = {
	// Checks the message against the global blacklist
	runGlobalBlacklist(channel, userstate, message, channelID, userID, userRoleID, channelSettings, runGlobalBlacklistCallback) {
		// If there is some weird channel database error, don't execute
		if(channelID === -1){
			runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			dbPool.query(`SELECT * FROM public."globalBlacklist"`, [], function (err, globalBlacklist) {
				if(err){
					console.error('Error running global blacklist query.', err);
					runGlobalBlacklistCallback(err, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
					return;
				} else if (globalBlacklist.rows.length === 0) {
					// Debug print
					if (global.runDebugPrints === true) {
						console.log("There are no global blacklist items.");
					}

					runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
					return;
				} else {
					// Debug print
					if (global.runDebugPrints === true) {
						console.log("There are " + globalBlacklist.rows.length + " global blacklist items.");
					}

					// Check the blacklist for any matching strings within the message
					for (var i = globalBlacklist.rows.length - 1; i >= 0; i--) {
						// If found, execute the mod action
						if (message.search(globalBlacklist.rows[i].input) != -1) {
							
							modUtils.modAction(channel, userstate, globalBlacklist.rows[i].action, channelSettings.rows[0].globalBlacklistWhisper);
							runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
							return;
						// If not found and it is the last item, run the callback
						} else if (message.search(globalBlacklist.rows[i].input) === -1 && i === 0) {
							runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
							return;
						}
					}
				}
			});
		}
	}
};