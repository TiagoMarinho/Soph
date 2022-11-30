import { parseParameters } from "../../../artificial intelligence/pnginfo.js"
import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js'
import colors from '../../../colors.json' assert { type: 'json' }
import extract from 'png-chunks-extract'
import encode from 'png-chunks-encode'
import text from 'png-chunk-text'
import fetch from 'node-fetch'

const metadata = async interaction => {

	await interaction.deferReply()

	const parameters = {}
	for (const option of interaction.options.data) {
		parameters[option.name] = 
			option.type === ApplicationCommandOptionType.Attachment ? 
				option.attachment : option.value
	}
	
	const inputImageUrlData = await fetch(parameters.image.url)
	const inputImageBuffer = await inputImageUrlData.arrayBuffer()
	const chunks = extract(Buffer.from(inputImageBuffer))

	const textChunks = chunks
		.filter(chunk => chunk.name === 'tEXt')
		.map(chunk => text.decode(chunk.data))

	const fields = textChunks.map(textChunk => {
		try {
			return parseParameters(textChunk.text)
		} catch {
			return {
				name: textChunk.keyword,
				value: textChunk.text
			}
		}
	}).flat().map(field => ({
		name: field.name,
		value: `\`\`\`${field.value}\`\`\``,
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