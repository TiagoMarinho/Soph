import { getRandomInt } from "../../../../utils/math.mjs"
import NodeGraph, { NodeFactory } from "./nodegraph.mjs"

const nodes = {
	ckpt: 				NodeFactory.CheckpointLoaderSimple,
	prompt: 			NodeFactory.CLIPTextEncode,
	negativePrompt: 	NodeFactory.CLIPTextEncode,
	fluxGuidance: 		NodeFactory.FluxGuidance,
	emptyLatent: 		NodeFactory.EmptyLatentImage,
	emptySD3Latent: 	NodeFactory.EmptySD3LatentImage,
	kSampler: 			NodeFactory.KSampler,
	upscaleLatent: 		NodeFactory.LatentUpscaleBy,
	kSamplerUpscale: 	NodeFactory.KSampler,
	decode: 			NodeFactory.VAEDecode,
	save: 				NodeFactory.SaveImage,
	previewDecode: 		NodeFactory.VAEDecode,
	previewSave: 		NodeFactory.SaveImage,
}

const createComfyUIGraph = imageGenerationParameters => {
	const MAX_UPSCALING_STEPS = 16
	const upscalingSeed = getRandomInt(0, 9_999_999_999)
	const upscalingSteps = Math.min(imageGenerationParameters.steps, MAX_UPSCALING_STEPS)
	const useUpscaling = imageGenerationParameters.latent_upscale > 1.0
	const isFlux = imageGenerationParameters.model.startsWith("flux")

	const nodeGraph = new NodeGraph

	nodeGraph
		.add(
			nodes.ckpt,
			nodes.prompt,
			nodes.negativePrompt,
			nodes.fluxGuidance,
			nodes.emptyLatent,
			nodes.emptySD3Latent,
			nodes.kSampler,
			nodes.upscaleLatent,
			nodes.kSamplerUpscale,
			nodes.decode,
			nodes.save
		)
		// connect static nodes
		.connect(nodes.ckpt.outputs.get("clip"), nodes.prompt.inputs.get("clip"))
		.connect(nodes.ckpt.outputs.get("clip"), nodes.negativePrompt.inputs.get("clip"))
		.connect(nodes.ckpt.outputs.get("model"), nodes.kSampler.inputs.get("model"))
		.connect(nodes.prompt.outputs.get("conditioning"), nodes.kSampler.inputs.get("positive"))
		.connect(nodes.negativePrompt.outputs.get("conditioning"), nodes.kSampler.inputs.get("negative"))
		.connect(nodes.emptyLatent.outputs.get("latent"), nodes.kSampler.inputs.get("latent_image"))
		.connect(nodes.kSampler.outputs.get("latent"), nodes.upscaleLatent.inputs.get("samples"))
		.connect(nodes.kSampler.outputs.get("latent"), nodes.decode.inputs.get("samples"))
		// upscale stuff
		.connect(nodes.ckpt.outputs.get("model"), nodes.kSamplerUpscale.inputs.get("model"))
		.connect(nodes.prompt.outputs.get("conditioning"), nodes.kSamplerUpscale.inputs.get("positive"))
		.connect(nodes.negativePrompt.outputs.get("conditioning"), nodes.kSamplerUpscale.inputs.get("negative"))

		.connect(nodes.ckpt.outputs.get("vae"), nodes.decode.inputs.get("vae"))
		.connect(nodes.decode.outputs.get("image"), nodes.save.inputs.get("images"))
		// set static values
		.setValue(nodes.upscaleLatent.inputs.get("upscale_method"), "bislerp")
		.setValue(nodes.kSampler.inputs.get("denoise"), 1.0)
		.setValue(nodes.save.inputs.get("filename_prefix"), "Soph")

	// now set dynamic stuff

	nodeGraph
		// set model
		.setValue(nodes.ckpt.inputs.get("ckpt_name"), imageGenerationParameters.model)
		// set empty latent
		.setValue(nodes.emptyLatent.inputs.get("width"), imageGenerationParameters.width)
		.setValue(nodes.emptyLatent.inputs.get("height"), imageGenerationParameters.height)
		.setValue(nodes.emptyLatent.inputs.get("batch_size"), imageGenerationParameters.batch)
		// set prompt
		.setValue(nodes.prompt.inputs.get("text"), imageGenerationParameters.prompt)
		.setValue(nodes.negativePrompt.inputs.get("text"), imageGenerationParameters.negative_prompt)
		// set sampling parameters
		.setValue(nodes.kSampler.inputs.get("seed"), imageGenerationParameters.seed)
		.setValue(nodes.kSampler.inputs.get("steps"), imageGenerationParameters.steps)
		.setValue(nodes.kSampler.inputs.get("cfg"), imageGenerationParameters.cfg)
		.setValue(nodes.kSampler.inputs.get("sampler_name"), imageGenerationParameters.sampler)
		.setValue(nodes.kSampler.inputs.get("scheduler"), imageGenerationParameters.scheduler)
		// set upscaling
		.setValue(nodes.upscaleLatent.inputs.get("scale_by"), imageGenerationParameters.latent_upscale)
		// flux
		.setValue(nodes.emptySD3Latent.inputs.get("width"), imageGenerationParameters.width)
		.setValue(nodes.emptySD3Latent.inputs.get("height"), imageGenerationParameters.height)
		.setValue(nodes.emptySD3Latent.inputs.get("batch_size"), imageGenerationParameters.batch)
		.setValue(nodes.fluxGuidance.inputs.get("guidance"), imageGenerationParameters.cfg)
		
		.setValue(nodes.kSamplerUpscale.inputs.get("seed"), upscalingSeed)
		.setValue(nodes.kSamplerUpscale.inputs.get("steps"), upscalingSteps)
		.setValue(nodes.kSamplerUpscale.inputs.get("cfg"), imageGenerationParameters.cfg)
		.setValue(nodes.kSamplerUpscale.inputs.get("sampler_name"), imageGenerationParameters.sampler)
		.setValue(nodes.kSamplerUpscale.inputs.get("scheduler"), imageGenerationParameters.scheduler)
		.setValue(nodes.kSamplerUpscale.inputs.get("denoise"), imageGenerationParameters.denoise)

	// toggle upscaling nodes
	if (useUpscaling) {
		nodeGraph
			.connect(nodes.upscaleLatent.outputs.get("latent"), nodes.kSamplerUpscale.inputs.get("latent_image"))
			.connect(nodes.kSamplerUpscale.outputs.get("latent"), nodes.decode.inputs.get("samples"))

		// Insert Preview (First Pass) Logic
		nodeGraph.add(nodes.previewDecode, nodes.previewSave)
		
		nodeGraph
			.connect(nodes.kSampler.outputs.get("latent"), nodes.previewDecode.inputs.get("samples"))
			.connect(nodes.ckpt.outputs.get("vae"), nodes.previewDecode.inputs.get("vae"))
			.connect(nodes.previewDecode.outputs.get("image"), nodes.previewSave.inputs.get("images"))
			.setValue(nodes.previewSave.inputs.get("filename_prefix"), "Soph_Preview")
	}

	if (isFlux)
		nodeGraph
			.connect(nodes.prompt.outputs.get("conditioning"), nodes.fluxGuidance.inputs.get("conditioning"))
			.connect(nodes.fluxGuidance.outputs.get("conditioning"), nodes.kSampler.inputs.get("positive"))
			.connect(nodes.emptySD3Latent.outputs.get("latent"), nodes.kSampler.inputs.get("latent_image"))
			.setValue(nodes.kSampler.inputs.get("cfg"), 1.0)

	const json = nodeGraph.toJSON()
	return json
}

export default createComfyUIGraph