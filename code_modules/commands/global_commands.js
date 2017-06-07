//------------------------------------------------
// Name: global_commands.js
// Author: Coby Allred
// Description: Checks chat input to see if it is attempting a global command. Runs the command if so.
//------------------------------------------------

const db_pool = require("../database/pool");
const async = require("async");
const botUtils = require("../bot_core/bot_utils.js");
const commandParse = require("./command_parser");
const responseParse = require("./response_parser");
const commandUtils = require("./command_utils");

function runGlobalCommand(channel, userstate, message, commandInfo) {
	async.waterfall([
		async.apply(botUtils.getChannelID, channel),
		async.apply(botUtils.getUserID, userstate),
		async.apply(botUtils.getUserRoleID, userstate),
		async.apply(commandUtils.runCommand, channel, userstate, message, commandInfo)
		], function(err, runResult) {
			if (err) {
				console.error('Error running global command.', err);
				//runGlobalCommandCallback(err, null);
				return;
			} else {
				console.log(runResult);
				//runGlobalCommandCallback(null, 1);
				return;
			}
		}
	)
	return;
};

module.exports = {
	checkIfGlobalCommand(channel, userstate, message, wasRemoved) {
		if(message.charAt(0) != "!" || wasRemoved == 1) {
			//checkIfGlobalCommandCallback(null, channel, userstate, message, 0);
			return;
		} else {
			if(message.indexOf(' ') >= 0) {
				var commandOnlyString = message.substr(0, message.indexOf(' '));
				var afterCommandString = message.substr(message.indexOf(' ') + 1);
			} else {
				var commandOnlyString = message;
				var afterCommandString = null;
			}
			
			// Queries the database to see if the commandOnlyString matches a valid global command
			db_pool.query(`SELECT * FROM public."global_commands" WHERE "global_command" = $1`, [commandOnlyString], function (err, commandInfo) {
				if(err){
					console.error('Error running global command query.', err);
					return;
				} else if (commandInfo.rows.length === 0) {
					// DEBUG PRINT
					console.log('No matching global command.');
					return;
				} else {
					// DEBUG PRINT
					console.log(`Matching global command with ID ${commandInfo.rows[0].global_command_id}.`);
					runGlobalCommand(channel, userstate, message, commandInfo);

					return;
				}
			});
		}

		
	}
};