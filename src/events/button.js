import { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import generate from '../shared/generate.js'
import { getLocalizedText } from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }
import defaults from '../artificial intelligence/defaults.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return

		try {
			if (interaction.customId !== `edit` && interaction.customId !== 'enhance') await interaction.deferUpdate()
		} catch (error) {
			return console.error(error)
		}

		console.log(`${interaction.user.username} clicked the "${interaction.customId}" button`)

		const message = await interaction.message.fetch()
		const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))

		const buttonHandlerById = {
			next: handleNextButton,
			previous: handlePreviousButton,
			repeat: handleRepeatButton,
			edit: handleEditButton,
			enhance: handleEnhanceButton
		}
		
		buttonHandlerById[interaction.customId](interaction, embeds)
	}
}

const handleNextButton = async (interaction, embeds) => {
	embeds.push(embeds.shift())
	return interaction.editReply({ embeds: embeds })
}

const handlePreviousButton = async (interaction, embeds) => {
	embeds.unshift(embeds.pop())
	return interaction.editReply({ embeds: embeds })
}

const handleRepeatButton = async (interaction, embeds) => {
	const cacheMessage = await getCacheMessage(interaction, embeds)
	const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])
	return generate(interaction, parameters)
}

const handleEditButton = async (interaction, embeds) => {
	const cacheMessage = await getCacheMessage(interaction, embeds)
	const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])
	
	const modal = createEditModal(interaction, parameters)
	return interaction.showModal(modal).catch(console.error)
}

const handleEnhanceButton = async (interaction, embeds) => {
	const cacheMessage = await getCacheMessage(interaction, embeds)
	const parameters = JSON.parse(cacheMessage.content.match(/^```json\n(.+)```$/)[1])

	if (parameters.hasOwnProperty('image')) {
		return interaction.reply({
			content: getLocalizedText(`enhance temporarily disabled`, interaction.locale),
			ephemeral: true
		})
	}

	const modal = createEnhanceModal(interaction, parameters)
	return interaction.showModal(modal).catch(console.error)
}

const getCacheMessage = async (interaction, embeds) => {
	const cacheChannelId = config.cacheChannelId
	const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)
	const cacheMessageId = embeds[0].data.url.match(/\/(\d+)$/)[1]
	return await cacheChannel.messages.fetch(cacheMessageId)
}

const createEditModal = (interaction, parameters) => {
	const [title, promptLabel, negativePromptLabel, scaleLabel, denoiseLabel] = [
		getLocalizedText(`edit prompt modal title`, interaction.locale),
		getLocalizedText(`prompt text field label`, interaction.locale),
		getLocalizedText(`negative prompt text field label`, interaction.locale),
		getLocalizedText(`enhance image scale field label`, interaction.locale),
		getLocalizedText(`enhance image denoise field label`, interaction.locale)
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
			.setValue('denoising' in parameters ? parameters.denoising.toString() : defaults.hiresFixModal.denoising)

		const thirdActionRow = new ActionRowBuilder().addComponents(scaleInput)
		const fourthActionRow = new ActionRowBuilder().addComponents(denoiseInput)

		modal.addComponents(thirdActionRow, fourthActionRow)
	}

	return modal
}

const createEnhanceModal = (interaction, parameters) => {
	const [title, scaleLabel, denoiseLabel] = [
		getLocalizedText(`enhance image modal title`, interaction.locale),
		getLocalizedText(`enhance image scale field label`, interaction.locale),
		getLocalizedText(`enhance image denoise field label`, interaction.locale)
	]

	const modal = new ModalBuilder()
		.setCustomId('enhance-image')
		.setTitle(title)

	const scaleInput = new TextInputBuilder()
		.setCustomId('scaleInput')
		.setLabel(scaleLabel)
		.setStyle(TextInputStyle.Short)
		.setValue(parameters.hrScale ? parameters.hrScale.toString() : defaults.hiresFixModal.hrScale)

	const denoiseInput = new TextInputBuilder()
		.setCustomId('denoiseInput')
		.setLabel(denoiseLabel)
		.setStyle(TextInputStyle.Short)
		.setValue(parameters.denoising ? parameters.denoising.toString() : defaults.hiresFixModal.denoising)

	const firstActionRow = new ActionRowBuilder().addComponents(scaleInput)
	const secondActionRow = new ActionRowBuilder().addComponents(denoiseInput)
	modal.addComponents(firstActionRow, secondActionRow)

	return modal
}