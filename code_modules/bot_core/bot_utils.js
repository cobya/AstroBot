//------------------------------------------------
// Name: bot_utils.js
// Author: Coby Allred
// Description: Contains various utility functions used across the bot's different features
//------------------------------------------------

const dbPool = require("../database/pool");
const async = require("async");

module.exports = {
	getChannelID(channel, userstate, message, getChannelIDCallback) {
		var channelName = channel.substr(1);
		dbPool.query(`SELECT channel_id FROM public."channels" WHERE channel_username = $1`, [channelName], function(err, channelID) {
			if(err){
				console.error('Error running channel ID query.', err);
				getChannelIDCallback(err, channel, userstate, message, -1);
				return;
			} else if (channelID.rows.length !== 0) {
				// DEBUG PRINT
				console.log(`Channel ID is ${channelID.rows[0].channel_id}`);

				getChannelIDCallback(null, channel, userstate, message, channelID.rows[0].channel_id);
				return;
			} else if (channelID.rows.length === 0) {
				console.error(`Error. Channel ID not found for ${channelName}.`);
				getChannelIDCallback(null, channel, userstate, message, -1);
				return;
			}
		});
	},

	getUserID(channel, userstate, message, channelID, getUserIDCallback) {
		if(channelID == -1){
			getUserIDCallback(null, channel, userstate, message, -1, -1);
			return;
		} else {
			var user = userstate.username;
			dbPool.query(`SELECT user_id FROM public."users" WHERE username = $1`, [user], function(err, userID) {
				if(err){
					console.error('Error running user ID query.', err);
					getUserIDCallback(err, channel, userstate, message, -1, -1);
					return;
				} else if (userID.rows.length !== 0) {
					// DEBUG PRINT
					console.log(`User ID is ${userID.rows[0].user_id}`);

					getUserIDCallback(null, channel, userstate, message, channelID, userID.rows[0].user_id);
					return;
				} else if (userID.rows.length === 0) {
					// DEBUG PRINT
					console.log(`User ID not found for ${user}.`);

					// If user is special (Moderator) and does not have a userid, create but return -1 for userID, else return -1 for userID
					if(userstate.mod == true) {
						// Create and insert into db here - TO DO
						getUserIDCallback(null, channel, userstate, message, channelID, -1);
						return;
					} else { // If not special usertype, just return -1
						getUserIDCallback(null, channel, userstate, message, channelID, -1);
						return;
					}
					
				}
			});
		}
	},

	// Returns the role of a user within a specified channel
	getUserRoleID(channel, userstate, message, channelID, userID, getUserRoleIDCallback) {
		if(channelID == -1) { // If the channel doesn't exist, exits
			getUserRoleIDCallback(null, channel, userstate, message, -1, -1, -1);
			return;
		} else if (userID == -1) { // If the user doesn't exist, run a check of userstate to determine role
			if (userstate.mod == true) { // If mod, return a userrole of 5
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 5);
				return;
			} else if (userstate.subscriber == true) { // If sub, return a userrole of 7
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 7);
				return;
			} else { // Else assume regular viewer, return 8
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 8);
				return;
			}
		} else { // Else, query the DB and gets the user's role in the channel
			var user = userstate.username;
			dbPool.query(`SELECT role_id FROM public."channel_roles" WHERE user_id = $1 and channel_id = ${channelID}`, [userID], function(err, userRoleID) {
				if(err){ // If error running query, return the error
					getUserRoleIDCallback(err, channel, userstate, message, -1, -1, -1);
					return;
				} else if (userRoleID.rows.length !== 0) { // If there is a role for the user, return that
					// DEBUG PRINT
					console.log(`User ID ${userID} has Role ID ${userRoleID.rows[0].role_id}`);
					
					getUserRoleIDCallback(err, channel, userstate, message, channelID, userID, userRoleID.rows[0].role_id);
					return;
				} else if (userRoleID.rows.length === 0) { // If there is not a role for the user, determine one
					// DEBUG PRINT
					console.log(`User ID ${userID} does not have a role in Channel ID ${channelID}`);
					
					if (userstate.mod == true) { // If mod, return a userrole of 5
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 5);
						return;
					} else if (userstate.subscriber == true) { // If sub, return a userrole of 7
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 7);
						return;
					} else { // Else assume regular viewer, return 8
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 8);
						return;
					}
				}
			});
		}
	},

	createUser(username, channelID, createUserCallback) {

	},

	setUserRole(username, channelID, userRoleID){

	},

	removeChannel(channelName, channelID) {

	}

};