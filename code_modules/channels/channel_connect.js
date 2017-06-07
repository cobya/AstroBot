//------------------------------------------------
// Name: channel_connect.js
// Author: Coby Allred
// Description: Contains the functions necessary to connect to channels at startup and during operation
//------------------------------------------------

const db_pool = require("../database/pool");

module.exports = {
	readAllChannels(connectToServerResult, readAllChannelsCallback) {
		db_pool.query('SELECT * FROM public."channels"', [], function (err, channelList) {
			if(err){
				console.error('Error running channel list query.', err);
				readChannelsCallback(err, null);
				return;
			}

			console.log("There are " + channelList.rows.length + " channels detected.");

			for (var i = 0; i < channelList.rows.length; i++) {
				console.log("Channel: " + channelList.rows[i].channel_username);
			}

			readAllChannelsCallback(null, channelList);
		});
	},

	readNewChannels(connectToServerResult, readChannelsCallback) {
		db_pool.query('SELECT * FROM public."channels"', [], function (err, channelList) {
			if(err){
				console.error('Error running channel list query.', err);
				readChannelsCallback(err, null);
				return;
			}

			console.log("There are " + channelList.rows.length + " channels detected.");

			for (var i = 0; i < channelList.rows.length; i++) {
				console.log("Channel: " + channelList.rows[i].channel_username);
			}

			readNewChannels(null, channelList);
		});
	},

	// Connecting to every channel in the list, even if is "channel_connected" since the bot may have crashed
	connectToAllChannels(channelList, connectToAllChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			global.tmi_client.join(channelList.rows[i].channel_username);

			var channelConnectedQuery = `UPDATE public."channels" SET "channel_connected" = 'true' WHERE "channel_username" = '${channelList.rows[i].channel_username}';`;

			db_pool.query(channelConnectedQuery, [], function (err, channelList) {
				if(err){
					console.error('Error running channel connected update query.', err);
					connectToAllChannelsCallBack(err, null);
					return;
				}
			});


		}

		connectToAllChannelsCallBack(null, "connected to all channels");
	},

	// Connecting to only channels which are not already connected
	connectToNewChannels(channelList, connectToNewChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			if (channelList.rows[i].channel_connected.localeCompare("false") == 0){
				global.tmi_client.join(channelList.rows[i].channel_username);

				var channelConnectedQuery = `UPDATE public."channels" SET "channel_connected" = 'true' WHERE "channel_username" = '${channelList.rows[i].channel_username}';`;

				db_pool.query(channelConnectedQuery, [], function (err, channelList) {
					if(err){
						console.error('Error running channel connected update query.', err);
						connectToNewChannelsCallBack(err, null);
						return;
					}
				});
			}
		}

		connectToNewChannelsCallBack(null, "connected to new channels");
	}
};
