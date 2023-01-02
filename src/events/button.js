import { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import { generate } from '../commands/artificial intelligence/dream/execute.js'
import { getLocalizedText } from '../locale/languages.js'
import config from '../../config.json' assert { type: 'json' }

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (!interaction.isButton())
			return
		
		try {
			if (interaction.customId !== `edit`)
				await interaction.deferUpdate()
		} catch (error) {
			console.error(error)

			return
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
			const [title, promptLabel, negativePromptLabel] = 
				[
					getLocalizedText(`negative prompt text field label`, interaction.locale),
					getLocalizedText(`edit prompt modal title`, interaction.locale),
					getLocalizedText(`prompt text field label`, interaction.locale),
				]

			const modal = new ModalBuilder()
			.setCustomId('modal-edit')
			.setTitle(title)

			const promptInput = new TextInputBuilder()
				.setCustomId('promptInput')
				.setLabel(promptLabel)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(parameters.prompt ?? ``)

			const negativePromptInput = new TextInputBuilder()
				.setCustomId('negativePromptInput')
				.setLabel(negativePromptLabel)
				.setStyle(TextInputStyle.Paragraph)
				.setValue(parameters.negative ?? ``)
				.setRequired(false)

			const firstActionRow = new ActionRowBuilder().addComponents(promptInput)
			const secondActionRow = new ActionRowBuilder().addComponents(negativePromptInput)

			modal.addComponents(firstActionRow, secondActionRow)

			return interaction.showModal(modal).catch(console.error)
		}
	},
}