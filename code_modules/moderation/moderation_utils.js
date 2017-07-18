//------------------------------------------------
// Name: moderation_utils.js
// Author: Coby Allred
// Description: Contains all the utilities needed to execute channel moderation
//------------------------------------------------

var recentlyPermissionsContacted = [];
var recentlyTimed = [];

// Remove a channel from the recentlyPermissionsContacted
function removeFromRecentlyPermissionsContacted(channel) {
	var channelIndex;
	channelIndex = recentlyPermissionsContacted.indexOf(channel);

	if (channelIndex != -1) {
		recentlyPermissionsContacted.splice(channelIndex, 1);
	}
}

// Remove a user from the recentlyTimed
function removeFromRecentlyTimed(username) {
	var usernameIndex;
	usernameIndex = recentlyTimed.indexOf(username);

	if (usernameIndex != -1) {
		recentlyTimed.splice(usernameIndex, 1);
	}
}

module.exports = {
	// Runs a moderator action on a specified channel
	modAction(channel, userstate, action, customMessage) {
		// If the action === -1, ban the user
		if (action === -1) {
			// Debug print
			if (global.runDebugPrints === true) {
				console.log(`User ${userstate.username} is being banned in ${channel} with message ${customMessage}`);
			}

			// Attempts to ban the user
			global.tmi_client.ban(channel, userstate.username, customMessage);

			// When a notice is returned, check if the ban was valid
			global.tmi_client.on("notice", function (noticeChannel, noticeMsgID, noticeMessage) {
				// If the bot is not a moderator in the channel, contact the channel owner
				if (noticeMsgID.search("no_permission") != -1 && noticeChannel === channel) {
					// Send the whisper
					global.tmi_client.whisper(channel.substr(1), `Hello! I am running in your channel but I have not been given moderator permissions. Please run "/mod itsastrobot" in your channel. I am a bot, and this action was performed automatically.`);

					// Push it and set the timeout to remove it after 1h
					recentlyPermissionsContacted.push(channel);
					setTimeout(function() { 
						removeFromRecentlyPermissionsContacted(channel);
					}, 3600000);
				// If the ban is successful, send them a message stating the ban reason
				} else if (noticeMsgID.search("ban_success") != -1 && noticeMessage.toLowerCase().search(userstate.username) != -1 && noticeChannel === channel) {
					var whisperMessage = `You have been banned in ${channel.substr(1)}. Reason: ${customMessage}`;
					global.tmi_client.whisper(userstate.username, whisperMessage);
				} 
			});

		// Else, timeout the user for the specified number of action seconds
		} else {
			// Debug print
			if (global.runDebugPrints === true) {
				console.log(`User ${userstate.username} is being timed out for ${action} in ${channel} with message ${customMessage}`);
			}

			// If the user was not recently timed out, start with 10 second timeout
			var userRecentlyTimedIndex = recentlyTimed.indexOf(userstate.username);
			var timeoutLength;
			if (userRecentlyTimedIndex === -1) {
				// Set the timeout length and timeout the user
				timeoutLength = 10;
				global.tmi_client.timeout(channel, userstate.username, timeoutLength, customMessage);

				// Push the user to recentlyTimed and set the timeout to remove it after 10m
				recentlyTimed.push(userstate.username);
				setTimeout(function() { 
					removeFromRecentlyTimed(userstate.username);
				}, 600000); 
			} else {
				// Set the timeout length and timeout the user
				timeoutLength = action;
				global.tmi_client.timeout(channel, userstate.username, timeoutLength, customMessage);

				// Push the user to recentlyTimed and set the timeout to remove it after 10m
				recentlyTimed.push(userstate.username);
				setTimeout(function() { 
					removeFromRecentlyTimed(userstate.username);
				}, 600000); 
			}

			// When a notice is returned, check if the timeout was valid
			global.tmi_client.on("notice", function (noticeChannel, noticeMsgID, noticeMessage) {
				console.log(noticeMessage);
				// If the bot is not a moderator in the channel, contact the channel owner
				if (noticeMsgID.search("no_permission") != -1 && noticeChannel === channel) {
					// Check to see if they were recently contacted and contact if not
					if (recentlyPermissionsContacted.indexOf(channel) === -1) {
						// Send the whisper
						global.tmi_client.whisper(channel.substr(1), `Hello! I am running in your channel but I have not been given moderator permissions. Please run "/mod itsastrobot" in your channel. I am a bot, and this action was performed automatically.`);

						// Push it and set the timeout to remove it after 1h
						recentlyPermissionsContacted.push(channel);
						setTimeout(function() { 
							removeFromRecentlyPermissionsContacted(channel);
						}, 3600000);
					}
				// If the timeout was successful, send them a message stating the timeout reason
				} else if (noticeMsgID.search("timeout_success") != -1 && noticeMessage.toLowerCase().search(userstate.username) != -1 && noticeChannel === channel) {
					// Send the whisper
					var whisperMessage = `You have been timed out for ${timeoutLength} seconds in ${channel.substr(1)}. Reason: ${customMessage}`;
					global.tmi_client.whisper(userstate.username, whisperMessage);
				}
			});
		}
			
	} 
};
