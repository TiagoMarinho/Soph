import interrogate from '../../../artificial intelligence/interrogate.js'
import { 
	AttachmentBuilder, EmbedBuilder, 
	ActionRowBuilder, ButtonBuilder, 
	ComponentType, ButtonStyle,
	ApplicationCommandOptionType
} from 'discord.js'
import colors from '../../../colors.json' assert { type: 'json' }
import fetch from 'node-fetch'

const execute = async interaction => {

	const parameters = {}
	for (const option of interaction.options.data) {
		parameters[option.name] = 
			option.type === ApplicationCommandOptionType.Attachment ? 
				option.attachment : option.value
	}

	console.log(`Heartbeat ping: ${interaction.client.ws.ping}ms`)
	const isEphemeral = parameters.private ?? false
	const reply = await interaction.deferReply({ fetchReply: true, ephemeral: isEphemeral })
	console.log(`Roundtrip latency: ${reply.createdTimestamp - interaction.createdTimestamp}ms`)

	const inputImageUrlData = await fetch(parameters.image.url)
	const inputImageBuffer = await inputImageUrlData.arrayBuffer()

	const result = await interrogate(
		inputImageBuffer,
		parameters.model
	)

	let caption = result.caption;
	if (!parameters.model || parameters.model === 'deepdanbooru') {
		// if the model is deepdanbooru. replace underscores by space.
		caption = caption.replace(/_/g, ' ');
	}

	const embed = new EmbedBuilder()
		.setThumbnail(parameters.image.url)
		.setColor(colors.complete)
		.addFields({ name: `Model`, value: `${parameters.model || `deepdanbooru`}`, inline: true })
		.addFields({ name: `Interrogator result`, value: `\`\`\`${caption}\`\`\`` })
		.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })

	await interaction.editReply({ embeds: [embed] })
}
export default execute