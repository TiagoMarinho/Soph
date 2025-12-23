import { getRandomInt } from "../utils/math.mjs"

export default {
	prompt: "", 
	negative_prompt: "",
	seed: null,
	image: null,
	denoise: 0.6,
	variation_seed: -1,
	variation_strength: 0.0,
	steps: 28,
	upscaling_steps: 16,
	cfg: 6,
	width: 1024,
	height: 1024,
	sampler: "dpmpp_2m_sde_gpu",
	scheduler: "karras",
	model: "waiIllustriousSDXL_v150.safetensors",
	latent_upscale: 1.0,
	face_detailer: false, 
	clip_skip: 2,
	batch: 1,
}