import { getRandomInt } from "../../../../utils/math.mjs";

export default (imageGenerationParameters => ({
	"6": {
		"inputs": {
			"text": imageGenerationParameters.prompt,
			"clip": [
				"30",
				1
			]
		},
		"class_type": "CLIPTextEncode",
		"_meta": {
			"title": "CLIP Text Encode (Positive Prompt)"
		}
	},
	"8": {
		"inputs": {
			"samples": [
				imageGenerationParameters.latent_upscale > 1.0 ? "37" : "31",
				0
			],
			"vae": [
				"30",
				2
			]
		},
		"class_type": "VAEDecode",
		"_meta": {
			"title": "VAE Decode"
		}
	},
	"9": {
		"inputs": {
			"filename_prefix": "Soph",
			"images": [
				"8",
				0
			]
		},
		"class_type": "SaveImage",
		"_meta": {
			"title": "Save Image"
		}
	},
	"27": {
		"inputs": {
			"width": imageGenerationParameters.width,
			"height": imageGenerationParameters.height,
			"batch_size": imageGenerationParameters.batch
		},
		"class_type": "EmptySD3LatentImage",
		"_meta": {
			"title": "EmptySD3LatentImage"
		}
	},
	"30": {
		"inputs": {
			"ckpt_name": imageGenerationParameters.model
		},
		"class_type": "CheckpointLoaderSimple",
		"_meta": {
			"title": "Load Checkpoint"
		}
	},
	"31": {
		"inputs": {
			"seed": imageGenerationParameters.seed,
			"steps": imageGenerationParameters.steps,
			"cfg": 1.0,
			"sampler_name": "euler",
			"scheduler": "simple",
			"denoise": 1,
			"model": [
				"30",
				0
			],
			"positive": [
				"35",
				0
			],
			"negative": [
				"33",
				0
			],
			"latent_image": [
				"27",
				0
			]
		},
		"class_type": "KSampler",
		"_meta": {
			"title": "KSampler"
		}
	},
	"33": {
		"inputs": {
			"text": "",
			"clip": [
				"30",
				1
			]
		},
		"class_type": "CLIPTextEncode",
		"_meta": {
			"title": "CLIP Text Encode (Negative Prompt)"
		}
	},
	"35": {
		"inputs": {
			"guidance": 3.5,
			"conditioning": [
				"6",
				0
			]
		},
		"class_type": "FluxGuidance",
		"_meta": {
			"title": "FluxGuidance"
		}
	},
	"36": {
		"inputs": {
			"upscale_method": "bicubic",
			"scale_by": imageGenerationParameters.latent_upscale,
			"samples": imageGenerationParameters.latent_upscale > 1.0 ? [
				"31",
				0
			] : null,
		},
		"class_type": "LatentUpscaleBy",
		"_meta": {
			"title": "Upscale Latent By"
		}
	},
	"37": {
		"inputs": {
			"seed": getRandomInt(0, 9_999_999_999),
			"steps": 16,
			"cfg": 1,
			"sampler_name": "euler",
			"scheduler": "normal",
			"denoise": imageGenerationParameters.denoise,
			"model": [
				"30",
				0
			],
			"positive": [
				"35",
				0
			],
			"negative": [
				"33",
				0
			],
			"latent_image": [
				"36",
				0
			]
		},
		"class_type": "KSampler",
		"_meta": {
			"title": "KSampler (Upscale)"
		}
	}
}))