import { Events } from 'discord.js'

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isCommand()) 
			return

		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) return

		console.log(`${interaction.user.username} used the \x1b[7m /${interaction.commandName} \x1b[0m command`)

		try {
			await command.execute(interaction)
		} catch (error) {
			console.error(error)

			if (error.code === 10062) // bot took too long to respond/defer, trying to reply would crash it
				return

			if (interaction.replied)
				return
			
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
		}
	},
}