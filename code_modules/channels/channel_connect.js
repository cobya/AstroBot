//------------------------------------------------
// Name: channel_connect.js
// Author: Coby Allred
// Description: Contains the functions necessary to connect to channels at startup and during operation
//------------------------------------------------

var dbPool = require("../database/pool");

module.exports = {
	// Reads all of the channels within the database
	readAllChannels(connectToServerResult, readAllChannelsCallback) {
		dbPool.query(`SELECT * FROM public."channels"`, [], function (err, channelList) {
			if(err){
				console.error('Error running channel list query.', err);
				readAllChannelsCallback(err, null);
				return;
			}

			// Debug print
			if (global.runDebugPrints === true) {
				console.log("There are " + channelList.rows.length + " channels detected.");
			}

			readAllChannelsCallback(null, channelList);
		});
	},

	// Reads any unconnected channels from the database
	readNewChannels(connectToServerResult, readNewChannelsCallback) {
		dbPool.query(`SELECT * FROM public."channels" WHERE "channelConnected" = false`, [], function (err, channelList) {
			if(err){
				console.error('Error running channel list query.', err);
				readNewChannelsCallback(err, null);
				return;
			}

			// Debug print
			if (global.runDebugPrints === true) {
				console.log("There are " + channelList.rows.length + " channels detected.");
			}
			
			readNewChannelsCallback(null, channelList);
			return;
		});
	},

	// Connecting to every channel in the list, even if is channelConnected since the bot may have crashed
	connectToAllChannels(channelList, connectToAllChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			global.tmi_client.join(channelList.rows[i].channelName);

			dbPool.query(`UPDATE public."channels" SET "channelConnected" = true WHERE "channelName" = '${channelList.rows[i].channelName}';`, [], function (err, channelConnect) {
				if(err){
					console.error('Error running channel connected update query.', err);
					connectToAllChannelsCallBack(err, null);
					return;
				}
			});
		}

		connectToAllChannelsCallBack(null, channelList);
	},

	// Connecting to only channels which are not already connected
	connectToNewChannels(channelList, connectToNewChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			global.tmi_client.join(channelList.rows[i].channelName);

			dbPool.query(`UPDATE public."channels" SET "channelConnected" = true WHERE "channelName" = '${channelList.rows[i].channelName}';`, [], function (err, channelConnect) {
				if(err){
					console.error('Error running channel connected update query.', err);
					connectToNewChannelsCallBack(err, null);
					return;
				}
			});
		}

		connectToNewChannelsCallBack(null, "connected to new channels");
	}
};
