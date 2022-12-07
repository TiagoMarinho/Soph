import { Events, EmbedBuilder } from 'discord.js'
import { generate } from '../commands/artificial intelligence/dream/execute.js'
import languages from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (interaction.isButton()) { // TODO: move this somewhere else
			await interaction.deferUpdate()
	
			const message = await interaction.fetchReply()
			const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))

			if (interaction.customId == 'repeat') {
				const cacheChannelId = config.cacheChannelId
				const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

				const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
				const cacheMessage = await cacheChannel.messages.fetch(cacheMessageId)

				const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

				const reply = await interaction.followUp({
					content: languages[interaction.locale]?.["generating images"] ?? `Generating...`
				})

				generate(interaction, parameters, reply)
				return
			}
	
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