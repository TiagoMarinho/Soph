import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

export default {
	name: "interrogate",
	description: "Describe image using artifical inteligence",
	description_localizations: {
		"pt-BR": "Descreva uma imagem usando inteligência artifical"
	},
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionType.Attachment,
			name: "image",
			description: "Image to describe",
			name_localizations: {
				"pt-BR": "imagem"
			},
			description_localizations: {
				"pt-BR": "Imagem para ser descrevida"
			},
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: "model",
			description: "Interrogator model to describe image",
			name_localizations: {
				"pt-BR": "modelo"
			},
			description_localizations: {
				"pt-BR": "Qual modelo usar para descrever a imagem"
			},
			choices: [
				{ name: "Deepdanbooru", value: "deepdanbooru" },
				{ name: "CLIP", value: "clip" }
			],
			required: false
		}
	]
}