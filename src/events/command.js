import { Events, EmbedBuilder } from 'discord.js'
import { generate } from '../commands/artificial intelligence/dream/execute.js'
import { getLocalizedText } from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isCommand()) 
			return

		const command = interaction.client.commands.get(interaction.commandName)

		if (!command) return

		const fullUserTag = `${interaction.user.username}#${interaction.user.discriminator}`
		console.log(`${fullUserTag} used ${interaction}`)

		try {
			await command.execute(interaction)
		} catch (error) {
			console.error(error)

			if (error.code === 10062) // bot took too long to respond/defer, trying to reply would crash it
				return

			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
		}
	},
}