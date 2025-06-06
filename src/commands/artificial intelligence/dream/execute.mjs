import defaultImageGenerationParameters from "../../../artificial intelligence/default-sd-params.mjs"
import { getImages } from "../../../artificial intelligence/backends/comfyui/comfyui-fetch-image.mjs"
import { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, TextDisplayBuilder } from "discord.js"
import createFluxGraph from "../../../artificial intelligence/backends/comfyui/workflows/comfyui-flux-workflow.mjs"
import createSDXLGraph from "../../../artificial intelligence/backends/comfyui/workflows/comfyui-sdxl-workflow.mjs"

export default async interaction => {
	await interaction.deferReply()

	const imageGenerationParameters = {
		...defaultImageGenerationParameters, 
		...Object.fromEntries(interaction.options.data.map(({ name, value }) => [name, value]))
	}
	console.log(imageGenerationParameters)

	const SEED = imageGenerationParameters.seed

	// move this to a json with definition for models
	const graphs = { 
		"waiNSFWIllustrious_v140.safetensors": createSDXLGraph,
		"flux_schnell.safetensors": createFluxGraph,
		"flux_dev.safetensors": createFluxGraph
	}
	const GRAPH = graphs[imageGenerationParameters.model](imageGenerationParameters)

	const startTime = performance.now()
	// TODO: better error handling
	const imageBuffers = await getImages(GRAPH).catch(e => console.error(e))
	const timeTaken = performance.now() - startTime

	// TODO: add metadata and proper filename
	// TODO: create the embed in another file and call it here
	const filename = `Soph_${SEED}.png`
	const attachments = imageBuffers.map((imageBuffer, i) => new AttachmentBuilder(imageBuffer, { name: `Soph_${i}.png` }))

	const formattedTimeTaken = Math.floor( timeTaken / 100 ) / 10
	const stepsPerMillisecond = imageGenerationParameters.steps / timeTaken * imageGenerationParameters.batch
	const stepsPerSecond = Math.floor((imageGenerationParameters.steps * imageGenerationParameters.batch) / (timeTaken / 1000) * 10) / 10
	const footer = new TextDisplayBuilder({
		content: `-# seed: \`${SEED}\` time elapsed: \`${formattedTimeTaken}s\` it/s: \`${stepsPerSecond}\``
	})

	const media = attachments.map((_, i) => ({media:{url:`attachment://Soph_${i}.png`}}))
	const gallery = new MediaGalleryBuilder({ items: media })
	const container = new ContainerBuilder({ components: [gallery, footer] })

	await interaction.editReply({ files: attachments, components: [ container ], flags: MessageFlags.IsComponentsV2 })
}