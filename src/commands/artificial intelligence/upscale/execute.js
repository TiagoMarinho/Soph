import upscale from '../../../artificial intelligence/upscale.js'
import colors from '../../../colors.json' assert { type: 'json' }
import config from '../../../../config.json' assert { type: 'json' }
import { 
	AttachmentBuilder, EmbedBuilder, 
	ActionRowBuilder, ButtonBuilder, 
	ComponentType, ButtonStyle,
	ApplicationCommandOptionType
} from 'discord.js'
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

	const resultBuffer = await upscale(
		inputImageBuffer, 
		parameters.resize, 
		parameters.model, 
		parameters["secondary-model"], 
		parameters.mix
	)

	const attachment = new AttachmentBuilder(resultBuffer, { name: "upscaling_result.png" })
	
	const cacheChannelId = config.cacheChannelId
	const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)
	const cacheMessage = await cacheChannel.send({ files: [attachment] })
	const cachedAttachment = [...cacheMessage.attachments.values()][0]
	const url = cachedAttachment.url

	const embed = new EmbedBuilder()
		.setImage(url)
		.setColor(colors.complete)
		.setDescription(`Click on the image(s) to enlarge`)
		.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
		.addFields({ name: `Model`, value: `${parameters.model ?? `R-ESRGAN 4x+ Anime6B`}`, inline: true })

	if (parameters["secondary-model"]) {
		const mixPercent = (parameters.mix ?? 0.5) * 100
		embed
			.addFields({ name: `Secondary model`, value: `${parameters["secondary-model"]}`, inline: true })
			.addFields({ name: `Mix factor`, value: `${mixPercent}%`, inline: true })
	}

	embed
		.addFields({ name: `Resize factor`, value: `${parameters.resize ?? 2}x`, inline: false })
		.addFields({ name: `Width`, value: `${cachedAttachment.width}`, inline: true })
		.addFields({ name: `Height`, value: `${cachedAttachment.height}`, inline: true })

	const message = await interaction.fetchReply().catch(err => {
		console.log('unknown message.')
	})
	if (!message) return

	await interaction.editReply({ embeds: [embed] })
}
export default execute