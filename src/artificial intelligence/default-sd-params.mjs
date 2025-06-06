import { getRandomInt } from "../utils/math.mjs"

export default {
	prompt: "", 
	negative_prompt: "",
	get seed () {
		return getRandomInt(0, 9_999_999_999)
	},
	image: null,
	denoise: 0.6,
	variation_seed: -1,
	variation_strength: 0.0,
	steps: 28,
	cfg: 6,
	width: 1024,
	height: 1024,
	sampler: "dpmpp_2m_sde_gpu",
	scheduler: "karras",
	model: "waiNSFWIllustrious_v140.safetensors",
	latent_upscale: 1.0,
	clip_skip: 2,
	batch: 1,
}