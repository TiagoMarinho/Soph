import { Events, EmbedBuilder } from 'discord.js'
import { generate } from '../commands/artificial intelligence/dream/execute.js'
import { getLocalizedText } from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isModalSubmit())
			return
		
		try {
			await interaction.deferUpdate()
		} catch (error) {
			console.error(error)

			return
		}

		const message = await interaction.message.fetch()
		const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))

		if (interaction.customId === 'modal-edit') {
			const cacheChannelId = config.cacheChannelId
			const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

			const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
			const cacheMessage = await cacheChannel.messages.fetch(cacheMessageId)

			const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

            parameters.prompt = interaction.fields.getTextInputValue('promptInput')
            parameters.negative = interaction.fields.getTextInputValue('negativePromptInput')

			return generate(interaction, parameters)
		}
	},
}