//------------------------------------------------
// Name: bot_utils.js
// Author: Coby Allred
// Description: Contains various utility functions used across the bot's different features
//------------------------------------------------

var dbPool = require("../database/pool");
var async = require("async");

module.exports = {
	// Gets the channel ID from a message
	getChannelID(channel, userstate, message, getChannelIDCallback) {
		var channelName = channel.substr(1);
		dbPool.query(`SELECT "userID" FROM public."channels" WHERE "channelName" = $1`, [channelName], function(err, channelID) {
			if(err){
				console.error('Error running channel ID query.', err);
				getChannelIDCallback(err, channel, userstate, message, -1);
				return;
			} else if (channelID.rows.length !== 0) {
				// DEBUG PRINT
				if (global.runDebugPrints === true) {
					console.log(`Channel's user ID is ${channelID.rows[0].userID}`);
				}

				getChannelIDCallback(null, channel, userstate, message, channelID.rows[0].userID);
				return;
			} else if (channelID.rows.length === 0) {
				console.error(`Error. Channel's user ID not found for ${channelName}.`);
				getChannelIDCallback(null, channel, userstate, message, -1);
				return;
			}
		});
	},

	// Gets the user ID from a message
	getUserID(channel, userstate, message, channelID, getUserIDCallback) {
		if(channelID === -1){
			getUserIDCallback(null, channel, userstate, message, -1, -1);
			return;
		} else {
			var user = userstate.username;
			dbPool.query(`SELECT "userID" FROM public."users" WHERE "username" = $1`, [user], function(err, userID) {
				if(err){
					console.error('Error running user ID query.', err);
					getUserIDCallback(err, channel, userstate, message, -1, -1);
					return;
				} else if (userID.rows.length !== 0) {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`User ID is ${userID.rows[0].userID}`);
					}

					getUserIDCallback(null, channel, userstate, message, channelID, userID.rows[0].user_id);
					return;
				} else if (userID.rows.length === 0) {
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`User ID not found for ${user}.`);
					}
					

					// If user is special (Moderator) and does not have a userid, create but return -1 for userID, else return -1 for userID
					if(userstate.mod === true) {
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
		if(channelID === -1) { // If the channel doesn't exist, exits
			getUserRoleIDCallback(null, channel, userstate, message, -1, -1, -1);
			return;
		} else if (userID === -1) { // If the user doesn't exist, run a check of userstate to determine role
			if (userstate.mod === true) { // If mod, return a userrole of 4
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 4);
				return;
			} else if (userstate.subscriber === true) { // If sub, return a userrole of 2
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 2);
				return;
			} else { // Else assume regular viewer, return 1
				getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 1);
				return;
			}
		} else { // Else, query the DB and gets the user's role in the channel
			var user = userstate.username;
			dbPool.query(`SELECT "roleID" FROM public."userChannelRoles" WHERE "userID" = $1 and "channelUserID" = ${channelID}`, [userID], function(err, userRoleID) {
				if(err){ // If error running query, return the error
					getUserRoleIDCallback(err, channel, userstate, message, -1, -1, -1);
					return;
				} else if (userRoleID.rows.length !== 0) { // If there is a role for the user, return that
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`User ID ${userID} has Role ID ${userRoleID.rows[0].roleID}`);
					}
					
					
					getUserRoleIDCallback(err, channel, userstate, message, channelID, userID, userRoleID.rows[0].roleID);
					return;
				} else if (userRoleID.rows.length === 0) { // If there is not a role for the user, determine one
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`User ID ${userID} does not have a role in Channel ID ${channelID}`);
					}
					
					if (userstate.mod === true) { // If mod, return a userrole of 4
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 4);
						return;
					} else if (userstate.subscriber === true) { // If sub, return a userrole of 2
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 2);
						return;
					} else { // Else assume regular viewer, return 1
						getUserRoleIDCallback(null, channel, userstate, message, channelID, userID, 1);
						return;
					}
				}
			});
		}
	},

	// Returns the table of channel settings that will be used in subsequent operations
	getChannelSettings(channel, userstate, message, channelID, userID, userRoleID, getChannelSettingsCallback) {
		if(channelID === -1) { // If the channel doesn't exist, exits
			getChannelSettingsCallback(null, channel, userstate, message, -1, -1, -1, -1);
			return;
		} else { // Else, query the DB and gets the channel's settings
			var user = userstate.username;
			dbPool.query(`SELECT * FROM public."channelSettings" WHERE "channelUserID" = ${channelID}`, [], function(err, channelSettings) {
				if(err){ // If error running query, return the error
					getChannelSettingsCallback(err, channel, userstate, message, -1, -1, -1, -1);
					return;
				} else if (channelSettings.rows.length !== 0) { // If there is are channel settings, return that
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Channel ID ${userID} has settings of ${channelSettings.rows[0]}`);
					}
					
					
					getChannelSettingsCallback(err, channel, userstate, message, channelID, userID, userRoleID, channelSettings);
					return;
				} else { // If there are no channel settings, send an error back
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Channel ID ${userID} does not a have valid settings row.`);
					}
					
					getChannelSettingsCallback("There is not a valid channel settings row.", channel, userstate, message, channelID, userID, userRoleID, -1);
					return;
				}
			});
		}
	},

	// Creates a new user within the database
	createUser(username, channelID, createUserCallback) {

	},

	// Sets a user's role within the database
	setUserRole(username, channelID, userRoleID){

	},

	// Removes a channel from the database
	removeChannel(channelName, channelID) {

	},

	// Sets all possible cooldowns to false
	setCooldownsFalse(channelList, setCooldownsFalseCallback) {
		if (channelList.rows.length === 0) {
			setCooldownsFalseCallback(null, "There are no channels detected.");
			return;
		} else {
		
			var channelCommandQuery = `UPDATE public."channelCommands" SET "commandOnCooldown" = false;`;
			dbPool.query(channelCommandQuery, [], function (err, channelCommandCooldown) {
				if(err){
					console.error('Error running cooldown update query.', err);
					return;
				}
			});

			var channelGlobalCommandQuery = `UPDATE public."channelGlobalCommandSettings" SET "commandOnCooldown" = false;`;
			dbPool.query(channelGlobalCommandQuery, [], function (err, channelGlobalCommandCooldown) {
				if(err){
					console.error('Error running cooldown update query.', err);
					return;
				}
			});
			
			setCooldownsFalseCallback(null, "Cooldowns have been set to false");
			return;
		}		
	}

};