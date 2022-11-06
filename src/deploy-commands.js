import fs from 'node:fs'
import path from 'node:path'
import { REST, Routes } from 'discord.js'
import config from '../config.json' assert { type: 'json' }
import getCommandsByCategory from './getcommands.js'

(async () => {

	const commands = [];
	const commandsByCategory = await getCommandsByCategory()


	for (const categoryName of Object.keys(commandsByCategory)) {
		for (const command of commandsByCategory[categoryName]) {
			commands.push(command.data)
		}
	}

	const rest = new REST({ version: '10' }).setToken(config.token)

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(config.clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();