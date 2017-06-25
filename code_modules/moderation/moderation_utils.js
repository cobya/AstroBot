//------------------------------------------------
// Name: moderation_utils.js
// Author: Coby Allred
// Description: Contains all the utilities needed to execute channel moderation
//------------------------------------------------

function checkIfModerator(channel) {

}

module.exports = {
	modAction(channel, userstate, action, customMessage) {
		// If the action == -1, ban the user
		if (action == -1) {
			// Debug print
			if (global.runDebugPrints == true) {
				console.log(`User ${userstate.username} is being banned in ${channel} with message ${customMessage}`);
			}

			global.tmi_client.ban(channel, userstate.username, customMessage);

			global.tmi_client.on("notice", function (noticeChannel, noticeMsgID, noticeMessage) {
				if (noticeMsgID.search("no_permission") != -1 && noticeChannel == channel) {
					global.tmi_client.whisper(channel.substr(1), `Hello! I am running in your channel but I have not been given moderator permissions. 
						Please run "/mod itsastrobot" in your channel. I am a bot, and this action was performed automatically.`);
				} else if (noticeMsgID.search("bad_ban") == -1 && noticeChannel == channel) {
					var whisperMessage = `You have been banned in ${channel.substr(1)}. Reason: ${customMessage}`;
					global.tmi_client.whisper(userstate.username, whisperMessage);
				} 
			});

			// Else, timeout the user for the specified number of action seconds
		} else {
			// Debug print
			if (global.runDebugPrints == true) {
				console.log(`User ${userstate.username} is being timed out for ${action} in ${channel} with message ${customMessage}`);
			}

			global.tmi_client.timeout(channel, userstate.username, action, customMessage);
			global.tmi_client.on("notice", function (noticeChannel, noticeMsgID, noticeMessage) {
				if (noticeMsgID.search("no_permission") != -1 && noticeChannel == channel) {
					global.tmi_client.whisper(channel.substr(1), `Hello! I am running in your channel but I have not been given moderator permissions. 
						Please run "/mod itsastrobot" in your channel. I am a bot, and this action was performed automatically.`);
				} else if (noticeMsgID.search("bad_timeout") == -1 && noticeChannel == channel) {
					var whisperMessage = `You have been timed out for ${action} seconds in ${channel.substr(1)}. Reason: ${customMessage}`;
					global.tmi_client.whisper(userstate.username, whisperMessage);
				}
			});
		}
			
	} 
};
