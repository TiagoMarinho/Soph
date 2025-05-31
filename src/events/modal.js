import { Events, EmbedBuilder, Emoji } from 'discord.js'
import generate from '../shared/generate.js'
import config from '../../config.json' assert { type: 'json' }
import { getLocalizedText } from '../locale/languages.js'
import emojis from '../emojis.json' assert { type: 'json' }

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
		
		console.log(`${interaction.user.username} submitted the \x1b[7m ${interaction.customId} \x1b[0m modal`)

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

			return generate(interaction, parameters, emojis.edit)
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

			return generate(interaction, parameters, emojis.enhance)
		}

		// VARIATIONS MODAL:

		if (interaction.customId === 'variation-image') {
			const strengthValue = parseFloat( interaction.fields.getTextInputValue('strengthInput').replace(',', '.') )

			if (isNaN(strengthValue) || strengthValue < 0 || strengthValue > 1) {
				return interaction.followUp({
					content: getLocalizedText(`variation image invalid strength`, interaction.locale),
					ephemeral: true
				})
			}

			const cacheChannelId = config.cacheChannelId
			const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

			const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
			const cacheMessage = await cacheChannel.messages.fetch(cacheMessageId)

			const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

			const seedMatch = embeds[0].data.fields[0].value.match(/\d+/)
			const selectedSeed = parseInt(seedMatch[0])

			parameters['variation-strength'] = strengthValue
			parameters['variation-seed'] = -1
			parameters.seed = selectedSeed

			return generate(interaction, parameters, emojis.branch)
		}
	},
}