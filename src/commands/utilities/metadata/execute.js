import { parseParameters } from "../../../artificial intelligence/pnginfo.js"
import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js'
import colors from '../../../colors.json' assert { type: 'json' }
import fetch from 'node-fetch'
import { getLocalizedText } from "../../../locale/languages.js"

const trimOverflowWithEllipsis = (str, maxLength) => {
	if (str.length <= 1024)
		return str
	
	const ellipsis = "..."
	const ellipsedStr = str.slice(0, maxLength - ellipsis.length) + ellipsis

	return ellipsedStr
}

const metadata = async interaction => {

	await interaction.deferReply()

	const parameters = {}
	for (const option of interaction.options.data) {
		parameters[option.name] = 
			option.type === ApplicationCommandOptionType.Attachment ? 
				option.attachment : option.value
	}

	if (!parameters.image.name.endsWith(`.png`))
		return interaction.reply({
			content: getLocalizedText("png info unknown file type", interaction.locale),
			ephemeral: true
		})

	const MAX_FIELD_LENGTH = 1024
	
	const inputImageUrlData = await fetch(parameters.image.url)
	const inputImageBuffer = await inputImageUrlData.arrayBuffer()
	const buffer = Buffer.from(inputImageBuffer)
	const parsedParams = await parseParameters(buffer)
	const fields = parsedParams
		.filter(field => field.name.length > 0)
		.map(field => ({
			name: field.name,
			value: "```" + trimOverflowWithEllipsis(field.value, MAX_FIELD_LENGTH - 6) + "```",
			inline: field.value?.length <= 16
		}))

	const embed = new EmbedBuilder()
		.setColor(colors.complete)
		.setThumbnail(parameters.image.url)
		.setTitle('Metadata')
		.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
		.addFields(...fields)

	await interaction.editReply({ embeds: [embed] })
}

export default metadata