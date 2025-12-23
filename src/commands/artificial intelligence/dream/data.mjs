export default {
	"name": "dream",
	"description": "Generate images using artificial intelligence",
	"type": 1,
	"options": [
		{
			type: 3,
			name: "prompt",
			description: "Description of the desired image content",
			required: true
		},
		{
			type: 3,
			name: "negative_prompt",
			description: "Things not to include in the image",
			required: false
		},
		{
			type: 4,
			name: "width",
			description: "Width of the image in pixels",
			required: false,
			min_value: 256,
			max_value: 2048
		},
		{
			type: 4,
			name: "height",
			description: "Height of the image in pixels",
			required: false,
			min_value: 256,
			max_value: 2048
		},
		{
			type: 10,
			name: "latent_upscale",
			description: "How much to upscale the latent image",
			required: false,
			min_value: 1.0,
			max_value: 2.0
		},
		{
			type: 5,
			name: "face_detailer",
			description: "Detect and upscale faces",
			required: false,
		},
		{
			type: 10,
			name: "denoise",
			description: "How noise to add to the upscaled latent image",
			required: false,
			min_value: 0.0,
			max_value: 1.0
		},
		{
			type: 4,
			name: "seed",
			description: "Seed for the latent-space noise",
			required: false,
		},
		{
			type: 10,
			name: "cfg",
			description: "How closely the output should follow the prompt",
			required: false,
			min_value: 1,
			max_value: 20
		},
		{
			type: 4,
			name: "steps",
			description: "Number of samples to use",
			required: false,
			min_value: 1,
			max_value: 50
		},
		{
			type: 3,
			name: "sampler",
			description: "Which sampler to use when generating the image",
			choices: [
				{ name: "Euler", value: "euler" },
				{ name: "Euler Ancestral", value: "euler_ancestral" },
				{ name: "DPM++ 2M SDE", value: "dpmpp_2m_sde_gpu" },
			],
			required: false
		},
		{
			type: 3,
			name: "scheduler",
			description: "Which scheduler to use when generating the image",
			choices: [
				{ name: "Simple", value: "simple" },
				{ name: "Karras", value: "karras" },
				{ name: "Exponential", value: "exponential" },
			],
			required: false
		},
		{
			type: 3,
			name: "model",
			description: "Which model to use when generating the image",
			choices: [
				//{ name: "Flux Dev", value: "flux_dev.safetensors" },
				//{ name: "Flux Schnell", value: "flux_schnell.safetensors" },
				{ name: "wai Illustrious SDXL v15", value: "waiIllustriousSDXL_v150.safetensors" },
			],
			required: false
		},
		{
			type: 3,
			name: "prompt_prefix",
			description: "Which prompt prefix to add",
			choices: [
				{ name: "wai Illustrious SDXL v15", value: "waiIllustriousSDXL_v150.safetensors" },
			],
			required: false
		},
		{
			type: 4,
			name: "batch",
			description: "Number of images to generate",
			required: false,
			min_value: 1,
			max_value: 9
		},
	]
}