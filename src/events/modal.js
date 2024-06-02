import { Events, EmbedBuilder } from 'discord.js'
import generate from '../shared/generate.js'
import config from '../../config.json' assert { type: 'json' }
import { getLocalizedText } from '../locale/languages.js'

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
		
		console.log(`${interaction.user.username} submitted the "${interaction.customId}" modal`)

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

			if ('hr-scale' in parameters) {
				const denoiseValue = parseFloat( interaction.fields.getTextInputValue('denoiseInput').replace(',', '.') );
				const scaleValue = parseFloat( interaction.fields.getTextInputValue('scaleInput').replace(',', '.') );

				if (isNaN(denoiseValue) || denoiseValue < 0 || denoiseValue > 1) {
					return interaction.followUp({
						content: getLocalizedText(`enhance image invalid denoise`, interaction.locale),
						ephemeral: true
					})
				}

				if (isNaN(scaleValue) || scaleValue < 1 || scaleValue > 10) {
					return interaction.followUp({
						content: getLocalizedText(`enhance image invalid scale`, interaction.locale),
						ephemeral: true
					})
				}

				parameters.denoising = denoiseValue
				parameters['hr-scale'] = scaleValue
			}

			return generate(interaction, parameters)
		}

		if (interaction.customId === 'enhance-image') {
			const denoiseValue = parseFloat( interaction.fields.getTextInputValue('denoiseInput').replace(',', '.') );
			const scaleValue = parseFloat( interaction.fields.getTextInputValue('scaleInput').replace(',', '.') );

			if (isNaN(denoiseValue) || denoiseValue < 0 || denoiseValue > 1) {
				return interaction.followUp({
					content: getLocalizedText(`enhance image invalid denoise`, interaction.locale),
					ephemeral: true
				})
			}

			if (isNaN(scaleValue) || scaleValue < 1 || scaleValue > 10) {
				return interaction.followUp({
					content: getLocalizedText(`enhance image invalid scale`, interaction.locale),
					ephemeral: true
				})
			}

			const cacheChannelId = config.cacheChannelId
			const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

			const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
			const cacheMessage = await cacheChannel.messages.fetch(cacheMessageId)

			const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

			const seedMatch = embeds[0].data.fields[0].value.match(/\d+/);
			const selectedSeed = parseInt(seedMatch[0]);

            parameters.denoising = denoiseValue
			parameters['hr-scale'] = scaleValue
			parameters['scale-latent'] = true
			parameters.seed = selectedSeed

			return generate(interaction, parameters)
		}
	},
}