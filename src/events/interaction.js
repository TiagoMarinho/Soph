import { Events, EmbedBuilder } from 'discord.js'

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (interaction.isButton()) { // TODO: move this somewhere else
			await interaction.deferUpdate()
	
			const message = await interaction.fetchReply()
			const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))
	
			switch (interaction.customId) {
				case `next`:
					embeds.push(embeds.shift())
					break
				case `previous`:
					embeds.unshift(embeds.pop())
					break
			}
	
			await interaction.editReply({ embeds: embeds })
		}

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