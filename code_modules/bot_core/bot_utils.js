//------------------------------------------------
// Name: bot_utils.js
// Author: Coby Allred
// Description: Contains various utility functions used across the bot's different features
//------------------------------------------------

const db_pool = require("../database/pool");
const async = require("async");

module.exports = {
	getChannelID(channel, getChannelIDCallback) {
		var channelName = channel.substr(1);
		db_pool.query(`SELECT channel_id FROM public."channels" WHERE channel_username = $1`, [channelName], function(err, channelID) {
			if(err){
				console.error('Error running channel ID query.', err);
				getChannelIDCallback(err, null);
				return;
			} else if (channelID.rows.length !== 0) {
				// DEBUG PRINT
				console.log(`Channel ID is ${channelID.rows[0].channel_id}`);

				getChannelIDCallback(null, channelID.rows[0].channel_id);
				return;
			} else if (channelID.rows.length === 0) {
				console.error(`Error. Channel ID not found for ${channelName}.`);
				getChannelIDCallback(null, -1);
				return;
			}
		});
	},

	getUserID(userstate, channelID, getUserIDCallback) {
		if(channelID == -1){
			return getUserIDCallback(null, -1, -1);
		} else {
			var user = userstate.username;
			db_pool.query(`SELECT user_id FROM public."users" WHERE username = $1`, [user], function(err, userID) {
				if(err){
					console.error('Error running user ID query.', err);
					getUserIDCallback(err, null, null);
					return;
				} else if (userID.rows.length !== 0) {
					// DEBUG PRINT
					console.log(`User ID is ${userID.rows[0].user_id}`);

					getUserIDCallback(null, channelID, userID.rows[0].user_id);
					return;
				} else if (userID.rows.length === 0) {
					// DEBUG PRINT
					console.log(`User ID not found for ${user}.`);

					// IF USER IS SPECIAL (Moderator +) IN CHANNEL, CREATE USERID
					if(userstate.mod == "true") {

					} else { // If not special usertype, just return -1
						getUserIDCallback(null, channelID, -1);
						return;
					}
					
				}
			});
		}
	},

	// 
	getUserRoleID(userstate, channelID, userID, getUserRoleIDCallback) {
		if(channelID == -1){
			getUserRoleIDCallback(null, -1);
			return;
		} else {
			var user = userstate.username;
			db_pool.query(`SELECT role_id FROM public."channel_roles" WHERE user_id = $1 and channel_id = ${channelID}`, [userID], function(err, userRoleID) {
				if(err){
					getUserRoleIDCallback(err, -1);
					return;
				} else if (userRoleID.rows.length !== 0) {
					// DEBUG PRINT
					console.log(`User ID ${userID} has Role ID ${userRoleID.rows[0].role_id}`);
					getUserRoleIDCallback(err, userRoleID.rows[0].role_id);
					return;
				} else if (userRoleID.rows.length === 0) {
					// DEBUG PRINT
					console.log(`User ID ${userID} does not have a role in Channel ID ${channelID}`);
					
					if (userstate.subscriber == true) {
						getUserRoleIDCallback(null, 8);
						return;
					} else {
						getUserRoleIDCallback(null, 8);
						return;
					}
				}
			});
		}
	},

	createUser(username, channelID) {

	},

	removeChannel(channelName, channelID) {

	}

};