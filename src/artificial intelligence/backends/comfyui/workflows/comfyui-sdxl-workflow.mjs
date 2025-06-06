import { getRandomInt } from "../../../../utils/math.mjs";

export default (imageGenerationParameters => ({
	"3": {
		"inputs": {
			"seed": imageGenerationParameters.seed,
			"steps": imageGenerationParameters.steps,
			"cfg": imageGenerationParameters.cfg,
			"sampler_name": imageGenerationParameters.sampler,
			"scheduler": imageGenerationParameters.scheduler,
			"denoise": 1,
			"model": [
				"16",
				0
			],
			"positive": [
				"6",
				0
			],
			"negative": [
				"7",
				0
			],
			"latent_image": [
				"5",
				0
			]
		},
		"class_type": "KSampler",
		"_meta": {
			"title": "KSampler"
		}
	},
	"5": {
		"inputs": {
			"width": imageGenerationParameters.width,
			"height": imageGenerationParameters.height,
			"batch_size": imageGenerationParameters.batch
		},
		"class_type": "EmptyLatentImage",
		"_meta": {
			"title": "Empty Latent Image"
		}
	},
	"6": {
		"inputs": {
			"text": imageGenerationParameters.prompt,
			"clip": [
				"16",
				1
			]
		},
		"class_type": "CLIPTextEncode",
		"_meta": {
			"title": "CLIP Text Encode (Prompt)"
		}
	},
	"7": {
		"inputs": {
			"text": imageGenerationParameters.negative_prompt,
			"clip": [
				"16",
				1
			]
		},
		"class_type": "CLIPTextEncode",
		"_meta": {
			"title": "CLIP Text Encode (Prompt)"
		}
	},
	"10": {
		"inputs": {
			"upscale_method": "nearest-exact",
			"scale_by": imageGenerationParameters.latent_upscale,
			"samples": imageGenerationParameters.latent_upscale > 1.0 ? [
				"3",
				0
			] : null,
		},
		"class_type": "LatentUpscaleBy",
		"_meta": {
			"title": "Upscale Latent By"
		}
	},
	"11": {
		"inputs": {
			"seed": getRandomInt(0, 9_999_999_999),
			"steps": 16,
			"cfg": imageGenerationParameters.cfg,
			"sampler_name": imageGenerationParameters.sampler,
			"scheduler": imageGenerationParameters.scheduler,
			"denoise": imageGenerationParameters.denoise,
			"model": [
				"16",
				0
			],
			"positive": [
				"6",
				0
			],
			"negative": [
				"7",
				0
			],
			"latent_image": [
				"10",
				0
			]
		},
		"class_type": "KSampler",
		"_meta": {
			"title": "KSampler (Upscale)"
		}
	},
	"12": {
		"inputs": {
			"filename_prefix": "Soph",
			"images": [
				"13",
				0
			]
		},
		"class_type": "SaveImage",
		"_meta": {
			"title": "Save Image"
		}
	},
	"13": {
		"inputs": {
			"samples": [
				imageGenerationParameters.latent_upscale > 1.0 ? "11" : "3",
				0
			],
			"vae": [
				"16",
				2
			]
		},
		"class_type": "VAEDecode",
		"_meta": {
			"title": "VAE Decode"
		}
	},
	"16": {
		"inputs": {
			"ckpt_name": imageGenerationParameters.model
		},
		"class_type": "CheckpointLoaderSimple",
		"_meta": {
			"title": "Load Checkpoint"
		}
	}
}))
