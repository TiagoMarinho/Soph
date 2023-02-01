import fetch from 'node-fetch'

import { roundToClosestMultipleOf } from '../utils/math.js';

import servers from './serverlist.json' assert { type: 'json' }

const requestImage = async (
	prompt = "",
	negativePrompt = "", 
	seed = -1, 
	initImage = null, 
	denoising = 0.75, 
	subseed = -1, 
	subseedStrength = 0.0, 
	steps = 30, 
	cfg = 9,
	width = 512,
	height = 512,
	sampler = `DPM++ 2M Karras`,
	hrScale = 1,
	latentSpace = false,
	clipSkip = 2
) => {
	const isImageToImage = initImage !== null

	const resizeModeTypes = {
		JUST_RESIZE: 0,
		CROP_AND_RESIZE: 1,
		RESIZE_AND_FILL: 2,
		JUST_RESIZE_LATENT_UPSCALE: 3,
	}
	const resizeMode = isImageToImage && latentSpace ? 
		resizeModeTypes.JUST_RESIZE_LATENT_UPSCALE : 
		resizeModeTypes.CROP_AND_RESIZE

	const highresFixUpscaler = latentSpace ?
		`Latent (nearest-exact)` : 
		`R-ESRGAN 4x+ Anime6B` // workaround for webui defaulting to lanczos

	const payload = {
		"init_images": [
			initImage
		],
		"resize_mode": resizeMode,
		"enable_hr": hrScale > 1,
		"denoising_strength": denoising,
		"hr_scale": hrScale,
		"hr_upscaler": highresFixUpscaler,
		"prompt": prompt,
		"seed": seed,
		"subseed": subseed,
		"subseed_strength": subseedStrength,
		"seed_resize_from_h": -1,
		"seed_resize_from_w": -1,
		"batch_size": 1,
		"n_iter": 1,
		"steps": steps,
		"cfg_scale": cfg,
		"width": width,
		"height": height,
		"restore_faces": false,
		"tiling": false,
		"negative_prompt": negativePrompt,
		"eta": 0,
		"s_churn": 0,
		"s_tmax": 0,
		"s_tmin": 0,
		"s_noise": 1,
		"sampler_index": sampler,
		"override_settings": {
			"enable_pnginfo": true,
			"CLIP_stop_at_last_layers": clipSkip
		}
	}

	const buff = Buffer.from(servers[0].credentials, 'utf-8')
	const base64Credentials = buff.toString('base64')

	const mode = `${isImageToImage ? `img` : `txt`}2img`
	const apiEndpoint = `${servers[0].address}/sdapi/v1/${mode}`
	const request = fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${base64Credentials}`
		}
	})
	return request
}

export default requestImage