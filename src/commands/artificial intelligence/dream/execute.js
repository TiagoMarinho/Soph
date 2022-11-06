import requestBatch from '../../../artificial inteligence/requestbatch.js'
import novelAIPrefix from '../../../artificial inteligence/novelaiprefix.json' assert { type: 'json' }
import { 
	AttachmentBuilder, EmbedBuilder, 
	ActionRowBuilder, ButtonBuilder, 
	ComponentType, ButtonStyle,
	ApplicationCommandOptionType
} from 'discord.js'
import extract from 'png-chunks-extract'
import encode from 'png-chunks-encode'
import text from 'png-chunk-text'
import fetch from 'node-fetch'

const handleButtons = message => {
	const minutesToMilliseconds = min => 1000 * 60 * min
	const collectorDuration = minutesToMilliseconds(10)
	const collector = message.createMessageComponentCollector({ 
		componentType: ComponentType.Button, 
		time: collectorDuration 
	})
	collector.on(`collect`, async i => {
		await i.deferUpdate()

		const message = await i.fetchReply()
		const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))

		switch (i.customId) {
			case `next`:
				embeds.push(embeds.shift())
				break
			case `previous`:
				embeds.unshift(embeds.pop())
				break
		}

		await i.editReply({ embeds: embeds })
	})
}

const getResolutionCost = (width, height) => {
	const sanitizedWidth = width || 512
	const sanitizedHeight = height || 512
	const defaultResolutionCost = 512 * 512
	const resolutionCost = (sanitizedWidth * sanitizedHeight) / defaultResolutionCost
	
	return resolutionCost
}

const setJobDone = (...embeds) => {
	const color = `#2E8B21`
	for (const embed of embeds)
		embed
			.setColor(color)
}

const dream = async interaction => {

	const parameters = {}
	for (const option of interaction.options.data) {
		parameters[option.name] = 
			option.type === ApplicationCommandOptionType.Attachment ? 
				option.attachment : option.value
	}

	console.log(`Heartbeat ping: ${interaction.client.ws.ping}ms`)
	const reply = await interaction.deferReply({ fetchReply: true })
	console.log(`Roundtrip latency: ${reply.createdTimestamp - interaction.createdTimestamp}ms`)

	// img2img
	const isImg2Img = typeof parameters.image !== `undefined`
	let base64InputImage = null
	if (isImg2Img) {
		const inputImageUrlData = await fetch(parameters.image.url)
		const inputImageBuffer = await inputImageUrlData.arrayBuffer()
		base64InputImage = `data:image/png;base64,${Buffer.from(inputImageBuffer).toString('base64')}`
	}

	const resolutionCostThreshold = 6
	if (getResolutionCost() > resolutionCostThreshold)
		return interaction.editReply(`Requested image resolution is too high`)

	// novelAI prefixing
	const promptParts = [parameters.prompt]
	const negativePromptParts = [parameters?.negative]

	if (parameters.prefix ?? true) {
		promptParts.unshift(novelAIPrefix.promptPrefix)
		negativePromptParts.unshift(novelAIPrefix.negativePrefix)
	}

	const finalPrompt = promptParts.filter(s => s?.trim()).join(`, `)
	const finalNegativePrompt = negativePromptParts.filter(s => s?.trim()).join(`, `)

	// request images
	const requests = 
		await requestBatch(
			parameters?.batch, 
			finalPrompt, 
			finalNegativePrompt,
			parameters?.seed,
			base64InputImage,
			parameters?.denoising,
			parameters?.["variation-seed"],
			parameters?.["variation-strength"],
			parameters?.steps,
			parameters?.cfg,
			parameters?.width,
			parameters?.height,
			parameters?.sampler
		)

	// handle responses
	const cacheChannelId = `1006069287003373598`
	const cacheChannel = await interaction.client.channels.cache.get(cacheChannelId)

	handleButtons(reply)

	for (const [index, request] of requests.entries()) {
		const response = await request
		const data = await response.json()
		const buffers = data.images.map(i => Buffer.from(i, "base64"))
		const filename = `${data.parameters.seed}.png`
		const attachments = buffers.map(buffer => {
			// write parameters to png chunks
			//const chunks = extract(buffer)
			//chunks.splice(-1, 0, text.encode('parameters', data.info))
			//const result = Buffer.from(encode(chunks))
			return new AttachmentBuilder(buffer, { name: filename })
		})

		const cacheMessage = await cacheChannel.send({ files: attachments })
		const url = [...cacheMessage.attachments.values()][0].url

		const numberOfImages = requests.length
		const isLastImage = index === requests.length - 1
		const color = `#A50A39`

		const message = await interaction.fetchReply()
		const embeds = message.embeds.map(embed => EmbedBuilder.from(embed))

		const embed = new EmbedBuilder()
			.setURL(`https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
			.setImage(url)
			.setColor(color)
			.setDescription(`Click on the image(s) to enlarge`)
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.addFields({ name: `Seed`, value: `${data.parameters.seed}`, inline: true })
			.addFields({ name: `Prompt`, value: `${data.parameters.prompt}`, inline: false })
			.setFooter({ text: `${numberOfImages - index}/${numberOfImages}` })

		if (isImg2Img)
			embed
				.setThumbnail(parameters.image.url)

		if (data.parameters.negative_prompt)
			embed
				.addFields({ name: `Negative prompt`, value: `${data.parameters.negative_prompt}`, inline: false })

		embeds.unshift(embed)

		if (isLastImage)
			setJobDone(...embeds)
		
		// buttons
		const rowData = []

		if (numberOfImages > 1)
			rowData.push([
				{ label: `←`, id: `previous`, style: ButtonStyle.Primary, disabled: !isLastImage },
				{ label: `→`, id: `next`, style: ButtonStyle.Primary, disabled: !isLastImage },
			])

		const rows = rowData.map(buttonData => {
			const row = new ActionRowBuilder()

			const buttons = buttonData.map(button =>
				new ButtonBuilder()
					.setCustomId(button.id)
					.setLabel(button.label)
					.setStyle(button.style)
					.setDisabled(button.disabled === true)
			)

			row.addComponents(...buttons)

			return row
		})

		await interaction.editReply({ embeds: embeds, components: rows })
	}
}
export default dream