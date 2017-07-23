//------------------------------------------------
// Name: channel_blacklist.js
// Author: Coby Allred
// Description: 
//------------------------------------------------

var dbPool = require("../database/pool");
var modUtils = require("./moderation_utils");

module.exports = {
	// Checks the message against the channel's blacklist
	runChannelBlacklist(channel, userstate, message, channelID, userID, userRoleID, channelSettings, hasExecuted, runChannelBlacklistCallback) {
		// If there is some weird channel database error or something has previously executed, don't execute
		if(channelID === -1 || hasExecuted === 1){
			runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
			return;
		} else {
			dbPool.query(`SELECT * FROM public."channelBlacklist" WHERE "channelUserID" = ${channelID}`, [], function (err, channelBlacklist) {
				if(err){
					console.error('Error running channel blacklist query.', err);
					runChannelBlacklistCallback(err, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
					return;
				} else if (channelBlacklist.rows.length === 0) {
					// Debug print
					if (global.runDebugPrints === true) {
						console.log(`There are no blacklist items for ${channel.substr(1)}.`);
					}

					runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
					return;
				} else {
					// Debug print
					if (global.runDebugPrints === true) {
						console.log(`There are ${channelBlacklist.rows.length} blacklist items for ${channel.substr(1)}.`);
					}

					// Check the blacklist for any matching strings within the message
					for (var i = channelBlacklist.rows.length - 1; i >= 0; i--) {
						// If found, execute the mod action
						if (message.search(channelBlacklist.rows[i].input) != -1) {
							var customMessage = `You have violated ${channel.substr(1)}'s channel blacklist.`;
							modUtils.modAction(channel, userstate, channelBlacklist.rows[i].action, customMessage);

							runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 1);
							return;
						// If not found and it is the last item, run the callback
						} else if (message.search(channelBlacklist.rows[i].input) === -1 && i === 0) {
							runChannelBlacklistCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings, 0);
							return;
						}
					}
				}
			});
		}
	}
};