import { Events } from 'discord.js'

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isAutocomplete()) 
			return

		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) return

		try {
			await command.autocomplete?.(interaction)
		} catch (error) {
			if (error.code === 10062) // bot took too long to autocomplete
				return

			console.error(error)
		}
	},
}