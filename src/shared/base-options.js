import { ApplicationCommandOptionType } from 'discord.js'
import models from "../artificial intelligence/models.js"
const modelChoices = models.map(m => ({
	name: m.model_name.replace(/[_-]/g, " "),
	value: m.title
}))

export const requiredOptions = [
	{
		type: ApplicationCommandOptionType.String,
		name: "prompt",
		description: "Description of the desired image content",
		description_localizations: {
			"pt-BR": "Descrição do resultado desejado"
		},
		required: true
	}
]

export const optionalOptions = [
	{
		type: ApplicationCommandOptionType.String,
		name: "negative",
		description: "Things not to include in the image",
		name_localizations: {
			"pt-BR": "negativa"
		},
		description_localizations: {
			"pt-BR": "Coisas que não devem ser incluídas na imagem"
		},
		required: false
	},
	{
		type: ApplicationCommandOptionType.String,
		name: "model",
		description: "What model  to use to generate the image",
		description_localizations: {
			"pt-BR": "Qual modelo deve ser usado para gerar a imagem"
		},
		choices: modelChoices,
		required: false
	},
	{
		type: ApplicationCommandOptionType.String,
		name: "sampler",
		description: "What sampler to use when generating the image",
		description_localizations: {
			"pt-BR": "Qual algoritmo deve ser usado refinando a imagem"
		},
		choices: [
			{ name: "Euler", value: "Euler" },
			{ name: "Euler Ancestral", value: "Euler a" },
			{ name: "Heun", value: "Heun" },
			{ name: "DPM fast", value: "DPM fast" },
			{ name: "DPM adaptive", value: "DPM adaptive" },
			{ name: "DPM2", value: "DPM2" },
			{ name: "DPM2 Ancestral", value: "DPM2 a" },
			{ name: "DPM2 Karras", value: "DPM2 Karras" },
			{ name: "DPM2 Ancestral Karras", value: "DPM2 a Karras" },
			{ name: "DPM++ 2S a", value: "DPM++ 2S a" },
			{ name: "DPM++ 2S a Karras", value: "DPM++ 2S a Karras" },
			{ name: "DPM++ 2M", value: "DPM++ 2M" },
			{ name: "DPM++ 2M Karras", value: "DPM++ 2M Karras" },
			{ name: "DPM++ SDE", value: "DPM++ SDE" },
			{ name: "DPM++ SDE Karras", value: "DPM++ SDE Karras" },
			{ name: "LMS", value: "LMS" },
			{ name: "LMS Karras", value: "LMS Karras" },
			{ name: "PLMS", value: "PLMS" },
			{ name: "DDIM", value: "DDIM" }
		],
		required: false
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "steps",
		description: "How many steps to refine the image for",
		description_localizations: {
			"pt-BR": "Quantas etapas o sampler deve refinar a imagem"
		},
		required: false,
		min_value: 10,
		max_value: 100
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: "cfg",
		description: "How closely the output should follow the prompt",
		description_localizations: {
			"pt-BR": "O quão rigorosa a IA deve ser desenhando o que foi pedido"
		},
		required: false,
		min_value: 1,
		max_value: 30
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "batch",
		description: "How many images to generate",
		description_localizations: {
			"pt-BR": "Quantas imagens devem ser geradas"
		},
		required: false,
		min_value: 1,
		max_value: 4
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "width",
		description: "Width of the resulting image",
		name_localizations: {
			"pt-BR": "largura"
		},
		description_localizations: {
			"pt-BR": "Largura da imagem resultante"
		},
		required: false,
		min_value: 64,
		max_value: 2048
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "height",
		description: "Height of the resulting image",
		name_localizations: {
			"pt-BR": "altura"
		},
		description_localizations: {
			"pt-BR": "Altura da imagem resultante"
		},
		required: false,
		min_value: 64,
		max_value: 2048
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "seed",
		description: "If you create an image with same parameters and seed as another image, you'll get the same result",
		description_localizations: {
			"pt-BR": "Se criar uma imagem com os mesmos parâmetros e seed que outra imagem, obterá o mesmo resultado"
		},
		required: false
	},
	{
		type: ApplicationCommandOptionType.Boolean,
		name: "prefix",
		description: "Append the base NovelAI prefixes to prompt and negative prompt",
		name_localizations: {
			"pt-BR": "prefixo"
		},
		description_localizations: {
			"pt-BR": "Adicionar tags do NovelAI predefinidas no início do pedido"
		},
		required: false
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: "variation-strength",
		description: "How much noise to add over the original seed. At 1, a completely different picture",
		name_localizations: {
			"pt-BR": "intensidade-variação"
		},
		description_localizations: {
			"pt-BR": "Quanto ruído acrescentar sobre a seed original. Em 1, uma imagem completamente diferente"
		},
		required: false,
		min_value: 0,
		max_value: 1
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "variation-seed",
		description: "Seed to mix into the generation",
		name_localizations: {
			"pt-BR": "seed-variação"
		},
		description_localizations: {
			"pt-BR": "Número usado pra gerar o ruído secundário"
		},
		required: false
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: "denoising",
		description: "How much noise to add over the input image",
		description_localizations: {
			"pt-BR": "Quanto ruído deve ser sobreposto na imagem providenciada"
		},
		required: false,
		min_value: 0,
		max_value: 1
	},
	{
		type: ApplicationCommandOptionType.Number,
		name: "hr-scale",
		description: "Scale of highres-fix output relative to original. At 2, double the image original size",
		name_localizations: {
			"pt-BR": "escala-highres-fix"
		},
		description_localizations: {
			"pt-BR": "Tamanho do highres-fix relativo a imagem. Em 2, o dobro do tamanho da imagem original"
		},
		required: false,
		min_value: 1,
		max_value: 10
	},
	{
		type: ApplicationCommandOptionType.Boolean,
		name: "scale-latent",
		description: "Upscale image in latent space",
		description_localizations: {
			"pt-BR": "Aumentar tamanho da imagem em espaço latente"
		},
		required: false
	},
	{
		type: ApplicationCommandOptionType.Integer,
		name: "clip-skip",
		description: "Which last layer of the CLIP model to stop at",
		description_localizations: {
			"pt-BR": "Em qual das últimas camadas do modelo CLIP parar"
		},
		required: false,
		min_value: 1,
		max_value: 12
	},
	{
		type: ApplicationCommandOptionType.Boolean,
		name: "private",
		description: "Send response in a message only you can see",
		name_localizations: {
			"pt-BR": "privado"
		},
		description_localizations: {
			"pt-BR": "Responder com uma mensagem que só você poderá ver"
		},
		required: false
	}
]