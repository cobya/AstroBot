//------------------------------------------------
// Name: global_blacklist.js
// Author: Coby Allred
// Description: Contains the functionality to implement a global blacklist and moderate messages against it
//------------------------------------------------

const dbPool = require("../database/pool");
const modUtils = require("./moderation_utils");

module.exports = {
	runGlobalBlacklist(channel, userstate, message, channelID, userID, userRoleID, runGlobalBlacklistCallback) {
		// If there is some weird channel database error, don't execute
		if(channelID == -1){
			runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
			return;
		} else {
			dbPool.query(`SELECT * FROM public.global_blacklist`, [], function (err, globalBlacklist) {
				if(err){
					console.error('Error running global blacklist query.', err);
					runGlobalBlacklistCallback(err, channel, userstate, message, channelID, userID, userRoleID, 1);
					return;
				} else if (globalBlacklist.rows.length === 0) {
					// Debug print
					if (global.runDebugPrints == true) {
						console.log("There are no global blacklist items.");
					}

					runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
					return;
				} else {
					// Debug print
					if (global.runDebugPrints == true) {
						console.log("There are " + globalBlacklist.rows.length + " global blacklist items.");
					}

					// Check the blacklist for any matching strings within the message
					for (var i = globalBlacklist.rows.length - 1; i >= 0; i--) {
						// If found, execute the mod action
						if (message.search(globalBlacklist.rows[i].input) != -1) {
							var customMessage = "You have violated the AstroBot global blacklist.";
							modUtils.modAction(channel, userstate, globalBlacklist.rows[i].action, customMessage);
							runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 1);
							return;
						// If not found and it is the last item, run the callback
						} else if (message.search(globalBlacklist.rows[i].input) == -1 && i == 0) {
							runGlobalBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, 0);
							return;
						}
					}
				}
			});
		}
	}
};