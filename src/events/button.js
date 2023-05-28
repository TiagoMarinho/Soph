import { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import generate from '../shared/generate.js'
import { getLocalizedText } from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isButton())
			return
		
		try {
			if (interaction.customId !== `edit` && interaction.customId !== 'enhance')
				await interaction.deferUpdate()
		} catch (error) {
			return console.error(error)
		}

		const message = await interaction.message.fetch()
		const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))
		
		switch (interaction.customId) {
			case `next`:
				embeds.push(embeds.shift())
				return interaction.editReply({ embeds: embeds })
			case `previous`:
				embeds.unshift(embeds.pop())
				return interaction.editReply({ embeds: embeds })
		}

		const cacheChannelId = config.cacheChannelId
		const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

		const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
		const cacheMessage = await cacheChannel.messages.fetch(cacheMessageId)

		const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

		if (interaction.customId === 'repeat') {
			return generate(interaction, parameters)
		}

		if (interaction.customId === 'edit') {
			const [title, promptLabel, negativePromptLabel, scaleLabel, denoiseLabel] = 
				[
					getLocalizedText(`edit prompt modal title`, interaction.locale),
					getLocalizedText(`prompt text field label`, interaction.locale),
					getLocalizedText(`negative prompt text field label`, interaction.locale),
					getLocalizedText(`enhance image scale field label`, interaction.locale),
					getLocalizedText(`enhance image denoise field label`, interaction.locale),
				]

			const modal = new ModalBuilder()
				.setCustomId('modal-edit')
				.setTitle(title)

			const promptInput = new TextInputBuilder()
				.setCustomId('promptInput')
				.setLabel(promptLabel)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(parameters.prompt ?? ` `) // space is workaround for previous modal value being filled in

			const negativePromptInput = new TextInputBuilder()
				.setCustomId('negativePromptInput')
				.setLabel(negativePromptLabel)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(parameters.negative ?? ` `) // space is workaround for previous modal value being filled in
				.setRequired(false)
			
			const firstActionRow = new ActionRowBuilder().addComponents(promptInput)
			const secondActionRow = new ActionRowBuilder().addComponents(negativePromptInput)

			modal.addComponents(firstActionRow, secondActionRow)

			if ('hr-scale' in parameters) {
				const scaleInput = new TextInputBuilder()
					.setCustomId('scaleInput')
					.setLabel(scaleLabel)
					.setStyle(TextInputStyle.Short)
					.setValue(parameters['hr-scale'].toString())

				const denoiseInput = new TextInputBuilder()
					.setCustomId('denoiseInput')
					.setLabel(denoiseLabel)
					.setStyle(TextInputStyle.Short)
					.setValue('denoising' in parameters ? parameters.denoising.toString() : `0.75`)
				
				const thirdActionRow = new ActionRowBuilder().addComponents(scaleInput)
				const fourthActionRow = new ActionRowBuilder().addComponents(denoiseInput)

				modal.addComponents(thirdActionRow, fourthActionRow)
				
			}

			return interaction.showModal(modal).catch(console.error)
		}

		if (interaction.customId === 'enhance') {
			const [title, scaleLabel, denoiseLabel] = 
				[
					getLocalizedText(`enhance image modal title`, interaction.locale),
					getLocalizedText(`enhance image scale field label`, interaction.locale),
					getLocalizedText(`enhance image denoise field label`, interaction.locale),
				]

			const modal = new ModalBuilder()
				.setCustomId('enhance-image')
				.setTitle(title)

			const scaleInput = new TextInputBuilder()
				.setCustomId('scaleInput')
				.setLabel(scaleLabel)
				.setStyle(TextInputStyle.Short)
				.setValue(parameters.hrScale ? parameters.hrScale.toString() : `2`)

			const denoiseInput = new TextInputBuilder()
				.setCustomId('denoiseInput')
				.setLabel(denoiseLabel)
				.setStyle(TextInputStyle.Short)
				.setValue(parameters.denoising ? parameters.denoising.toString() : `0.55`)

			const firstActionRow = new ActionRowBuilder().addComponents(scaleInput)
			const secondActionRow = new ActionRowBuilder().addComponents(denoiseInput)
			modal.addComponents(firstActionRow, secondActionRow)

			return interaction.showModal(modal).catch(console.error)
		}
	},
}