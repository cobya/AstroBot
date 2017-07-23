//------------------------------------------------
// Name: bot_utils.js
// Author: Coby Allred
// Description: Contains various utility functions used across the bot's different features
//------------------------------------------------

var dbPool = require("../database/pool");
var async = require("async");
var https = require("https");
var addZero = require("add-zero");
var twitchClientID = require("../../AstroBot_credentials").twitchClientID;

module.exports = {
	// Gets the channel ID from a message
	getChannelID(channel, userstate, message, getChannelIDCallback) {
		var channelName = channel.substr(1);
		dbPool.query(`SELECT "userID" FROM public."channels" WHERE "channelName" = $1`, [channelName], function(err, channelID) {
			if(err) {
				console.error('Error running channel ID query.', err);
				getChannelIDCallback(err, -1);
				return;
			} else if (channelID.rows.length !== 0) {
				// DEBUG PRINT
				if (global.runDebugPrints === true) {
					console.log(`Channel's user ID is ${channelID.rows[0].userID}`);
				}

				getChannelIDCallback(null, channelID.rows[0].userID);
				return;
			} else if (channelID.rows.length === 0) {
				console.error(`Error. Channel's user ID not found for ${channelName}.`);
				getChannelIDCallback(null, -1);
				return;
			}
		});
	},

	// Gets the user ID from a message
	getUserID(channel, userstate, message, getUserIDCallback) {
		dbPool.query(`SELECT "userID" FROM public."users" WHERE "username" = $1`, [userstate.username], function(err, userID) {
			if(err) {
				console.error('Error running user ID query.', err);
				getUserIDCallback(err, -1);
				return;
			} else if (userID.rows.length !== 0) {
				// DEBUG PRINT
				if (global.runDebugPrints === true) {
					console.log(`User ID is ${userID.rows[0].userID}`);
				}

				getUserIDCallback(null, userID.rows[0].userID);
				return;
			} else if (userID.rows.length === 0) {
				// DEBUG PRINT
				if (global.runDebugPrints === true) {
					console.log(`User ID not found for ${userstate.username}.`);
				}

				// If user is special (Moderator) and does not have a userid, create but return -1 for userID, else return -1 for userID
				if(userstate.mod === true) {
					getUserIDCallback(null, -1);
					return;
				} else { // If not special usertype, just return -1
					getUserIDCallback(null, -1);
					return;
				}
						
			}
		});
	},

	// Pings the Twitch API to get a user's ID
	getTwitchUserID(username, getTwitchUserIDCallback) {
		var userID = -1;

		// Sets the options for the API request
		var userIDRequestOptions = {
			host: `api.twitch.tv`,
			path: `/kraken/users?login=${username}`,
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Client-ID': twitchClientID.clientID
			}
		};

		// Sends the GET request to the Twitch Kraken API
		var getUserIDResponse = https.get(userIDRequestOptions, function(response) {
			// Get and parse the returned data
			var bodyChunks = [];
			response.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				var body = Buffer.concat(bodyChunks);
				var responseBodyObj = JSON.parse(body);

				// Grab the user ID and return it
				userID = responseBodyObj.users[0]._id;
				getTwitchUserIDCallback(null, username, userID);

				if (global.runDebugPrints === true) {
					console.log('Returned UserID: ' + userID);
				}

				return;
			})
		});
			
		// On an error from the request, log it
		getUserIDResponse.on('error', function(err) {
			console.log('User ID Fetch Error: ' + err.message);
			getTwitchUserIDCallback(err, username, -1);
			return;
		});
	},

	// Runs the ID grabbing queries in parallel for better response time
	getMessageIDs(channel, userstate, message, getMessageIDsCallback) {
		async.parallel([
			function(getChannelIDCallback) {
				module.exports.getChannelID(channel, userstate, message, getChannelIDCallback);
			},
			function(getUserIDCallback) {
				module.exports.getUserID(channel, userstate, message, getUserIDCallback);
			}
			], function(err, messageIDs) {
				if(err) {
					getMessageIDsCallback(err, -1, -1);
					return;
				} else {
					console.log(messageIDs);
					getMessageIDsCallback(null, channel, userstate, message, messageIDs[0], messageIDs[1]);
					return;
				}
			}
		);
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
			dbPool.query(`SELECT "roleID" FROM public."userChannelRoles" WHERE "userID" = ${userID} and "channelUserID" = ${channelID}`, [], function(err, userRoleID) {
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
				if(err) { // If error running query, return the error
					getChannelSettingsCallback(err, channel, userstate, message, -1, -1, -1, -1);
					return;
				} else if (channelSettings.rows.length !== 0) { // If there is are channel settings, return that
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Channel ID ${channelID} has settings of ${channelSettings.rows[0]}`);
					}
					
					getChannelSettingsCallback(null, channel, userstate, message, channelID, userID, userRoleID, channelSettings);
					return;
				} else { // If there are no channel settings, send an error back
					// DEBUG PRINT
					if (global.runDebugPrints === true) {
						console.log(`Channel ID ${channelID} does not a have valid settings row.`);
					}
					
					getChannelSettingsCallback("There is not a valid channel settings row.", channel, userstate, message, channelID, userID, userRoleID, -1);
					return;
				}
			});
		}
	},

	// Creates a new user within the database
	addNewUser(username, userID, addNewUserCallback) {
		dbPool.query(`INSERT INTO public."users"("userID", username) VALUES (${userID}, $1) ON CONFLICT ("userID") DO UPDATE SET "username" = $1`, [username], function(err, insertUserResult) {
			if (err) {
				addNewUserCallback(err, "Error inserting new user.");
			} else {
				addNewUserCallback(null, "Successfully created new user");
			}
		});
	},

	// Sets a user's role within the database
	setUserRole(userID, channelID, userRoleID, setUserRoleCallback){
		dbPool.query(`INSERT INTO public."userChannelRoles"()("userID", "channelUserID", "roleID") VALUES (${userID}, ${channelID}, ${userRoleID}) ON CONFLICT ("userID", "channelUserID") DO UPDATE SET "roleID" = ${userRoleID}`, [], function(erro, setUserRoleResult) {
			if(err){
				setUserRoleCallback(err, "Error setting user role.");
			} else {
				setUserRoleCallback(null, "Successfully set user role.");
			}
		});
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
	},

	// Creates a time string with the format HH:MM:SS:MS
	createTimeString() {
		var time = new Date();
		var timeString = addZero(time.getHours()) + ":" + addZero(time.getMinutes()) + ":" + addZero(time.getSeconds()) + ":" + addZero(time.getMilliseconds(), 3);

		return timeString;
	}
};