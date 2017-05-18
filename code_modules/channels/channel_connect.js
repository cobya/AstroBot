const db_pool = require("../database/pool");

module.exports = {
	readChannels(connectToServerResult, readChannelsCallback) {
		db_pool.query('SELECT * FROM public."Channels"', [], function (err, channelList) {
			if(err){
				console.error('Error running channel list query.', err);
				readChannelsCallback(err, null);
				return;
			}

			console.log("There are " + channelList.rows.length + " channels detected.");

			for (var i = 0; i < channelList.rows.length; i++) {
				console.log("Channel: " + channelList.rows[i].Channel_Name);
			}

			readChannelsCallback(null, channelList);
		});
	},

	// Connecting to every channel in the list, even if is "connected" since the bot may have crashed
	connectToStartupChannels(channelList, connectToStartupChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			global.tmi_client.join(channelList.rows[i].Channel_Name);

			var channelConnectedQuery = `UPDATE public."Channels" SET "Connected" = 'true' WHERE "Channel_Name" = '${channelList.rows[i].Channel_Name}';`;

			db_pool.query(channelConnectedQuery, [], function (err, channelList) {
				if(err){
					console.error('Error running channel connected update query.', err);
					connectToStartupChannelsCallBack(err, null);
					return;
				}
			});


		}

		connectToStartupChannelsCallBack(null, "connected to all channels");
	},

	// Connecting to only channels which are not already connected
	connectToNewChannels(channelList, connectToNewChannelsCallBack) {
		for(var i = 0; i < channelList.rows.length; i++){
			if (channelList.rows[i].Connected.localeCompare("false") == 0){
				global.tmi_client.join(channelList.rows[i].Channel_Name);

				var channelConnectedQuery = `UPDATE public."Channels" SET "Connected" = 'true' WHERE "Channel_Name" = '${channelList.rows[i].Channel_Name}';`;

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
