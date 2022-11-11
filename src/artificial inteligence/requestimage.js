import fetch from 'node-fetch'

import { roundToClosestMultipleOf } from '../utils/math.js';

const requestImage = async (
	prompt = "",
	negativePrompt = "", 
	seed = -1, 
	initImage = null, 
	denoising = 0.75, 
	subseed = -1, 
	subseedStrength = 0.0, 
	steps = 30, 
	cfg = 11,
	width = 512,
	height = 512,
	sampler = `DPM++ 2M`,
	highresFix = false,
	firstphaseWidth = 512,
	firstphaseHeight = 512
) => {
	const isImageToImage = initImage !== null

	// width and height must be multiples of 64
	const sanitizedWidth = roundToClosestMultipleOf(width, 64)
	const sanitizedHeight = roundToClosestMultipleOf(height, 64)

	const payload = {
		"init_images": [
			initImage
		],
		"enable_hr": highresFix,
		"denoising_strength": denoising,
		"firstphase_width": firstphaseWidth,
		"firstphase_height": firstphaseHeight,
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
		"width": sanitizedWidth,
		"height": sanitizedHeight,
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
			"enable_pnginfo": true
		}
	}
	const mode = `${isImageToImage ? `img` : `txt`}2img`
	const apiEndpoint = `http://127.0.0.1:7860/sdapi/v1/${mode}`
	const request = fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {'Content-Type': 'application/json'}
	})
	return request
}

export default requestImage