import defaultImageGenerationParameters from "../../../artificial intelligence/default-sd-params.mjs"
import { getImages } from "../../../artificial intelligence/backends/comfyui/comfyui-fetch-image.mjs"
import { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, TextDisplayBuilder } from "discord.js"
import promptPrefixes from "../../../artificial intelligence/prompt-prefixes.json" with { type: 'json' }
import createComfyUIGraph from "../../../artificial intelligence/backends/comfyui/workflows/comfyui-graph.mjs"
import { getRandomInt } from "../../../utils/math.mjs"

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
	imageGenerationParameters.seed ??= getRandomInt(0, 9_999_999_999);
	const SEED = imageGenerationParameters.seed 

	// Calculate total steps including upscaling logic (Must match comfyui-graph.mjs logic)
	const useUpscaling = imageGenerationParameters.latent_upscale > 1.0
	const MAX_UPSCALING_STEPS = 16
	const upscalingSteps = useUpscaling 
		? Math.min(imageGenerationParameters.steps, MAX_UPSCALING_STEPS) 
		: 0

	const GRAPH = createComfyUIGraph(imageGenerationParameters)
	const startTime = performance.now()

	const updateReply = async (buffers, isFinal = false) => {
		const timeNow = performance.now()
		const timeTaken = timeNow - startTime
		
		const attachments = buffers.map((imageBuffer, i) => new AttachmentBuilder(imageBuffer, { name: `Soph_${i}.png` }))

		const formattedTimeTaken = Math.floor( timeTaken / 100 ) / 10

		const stepsPerImage = isFinal 
			? imageGenerationParameters.steps + upscalingSteps 
			: imageGenerationParameters.steps

		const totalStepsDone = stepsPerImage * imageGenerationParameters.batch
		
		const stepsPerSecond = Math.floor(totalStepsDone / (timeTaken / 1000) * 10) / 10
		const statusText = isFinal ? "time elapsed" : "preview"
		const text = `-# seed: \`${SEED}\`\n-# ${statusText}: \`${formattedTimeTaken}s\`\n-# it/s: \`${stepsPerSecond}\``
		
		const footer = new TextDisplayBuilder({
			content: text
		})

		const media = attachments.map((_, i) => ({media:{url:`attachment://Soph_${i}.png`}}))
		const gallery = new MediaGalleryBuilder({ items: media })
		const container = new ContainerBuilder({ components: [footer, gallery] })

		await interaction.editReply({ files: attachments, components: [ container ], flags: MessageFlags.IsComponentsV2 })
	}

	// TODO: better error handling
	const allImages = await getImages(GRAPH, (intermediateBuffers, imageMetas) => {
		const isPreview = imageMetas.some(img => img.filename.startsWith("Soph_Preview"))
		
		if (isPreview) {
			updateReply(intermediateBuffers, false).catch(console.error)
		}
	}).catch(e => console.error(e))

	const finalBuffers = allImages
		.filter(({ meta }) => !meta.filename.startsWith("Soph_Preview"))
		.map(({ buffer }) => buffer)

	const batchSize = imageGenerationParameters.batch || 1
	const actualFinalBuffers = finalBuffers.slice(-batchSize)

	await updateReply(actualFinalBuffers, true)
}