import defaultImageGenerationParameters from "../../../artificial intelligence/default-sd-params.mjs"
import { getImages } from "../../../artificial intelligence/backends/comfyui/comfyui-fetch-image.mjs"
import { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, TextDisplayBuilder } from "discord.js"
import promptPrefixes from "../../../artificial intelligence/prompt-prefixes.json" with { type: 'json' }
import createComfyUIGraph from "../../../artificial intelligence/backends/comfyui/workflows/comfyui-graph.mjs"

const formatPrompt = (promptPrefixName, prompt, negativePrompt) => {
	if (!promptPrefixName) return { prompt, negativePrompt }
	const { promptPrefix, negativePromptPrefix } = promptPrefixes[promptPrefixName]
	return {
		prompt: [
			promptPrefix, 
			prompt
		].join(`, `),
		negativePrompt: [
			negativePromptPrefix, 
			negativePrompt
		].join(`, `)
	}
}

export default async interaction => {
	await interaction.deferReply()

	const imageGenerationParameters = {
		...defaultImageGenerationParameters, 
		...Object.fromEntries(interaction.options.data.map(({ name, value }) => [name, value]))
	}

	const formattedPrompt = formatPrompt(
		imageGenerationParameters.prompt_prefix,
		imageGenerationParameters.prompt, 
		imageGenerationParameters.negative_prompt
	)
	imageGenerationParameters.prompt = formattedPrompt.prompt,
	imageGenerationParameters.negative_prompt = formattedPrompt.negativePrompt

	const SEED = imageGenerationParameters.seed // FIXME: this is potentially a getter so it gets a random one here, then a new one later

	const GRAPH = createComfyUIGraph(imageGenerationParameters)

	const startTime = performance.now()
	// TODO: better error handling
	const imageBuffers = await getImages(GRAPH).catch(e => console.error(e))
	const timeTaken = performance.now() - startTime

	// TODO: add metadata and proper filename
	// TODO: create the embed in another file and call it here
	const filename = `Soph_${SEED}.png`
	const attachments = imageBuffers.map((imageBuffer, i) => new AttachmentBuilder(imageBuffer, { name: `Soph_${i}.png` }))

	const formattedTimeTaken = Math.floor( timeTaken / 100 ) / 10
	const stepsPerSecond = Math.floor((imageGenerationParameters.steps * imageGenerationParameters.batch) / (timeTaken / 1000) * 10) / 10
	const footer = new TextDisplayBuilder({
		content: `-# seed: \`${SEED}\` time elapsed: \`${formattedTimeTaken}s\` it/s: \`${stepsPerSecond}\``
	})

	const media = attachments.map((_, i) => ({media:{url:`attachment://Soph_${i}.png`}}))
	const gallery = new MediaGalleryBuilder({ items: media })
	const container = new ContainerBuilder({ components: [gallery, footer] })

	await interaction.editReply({ files: attachments, components: [ container ], flags: MessageFlags.IsComponentsV2 })
}