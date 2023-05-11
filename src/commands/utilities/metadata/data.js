import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

export default {
	name: "metadata",
	description: "Get metadata from a PNG file",
	name_localizations: {
		"pt-BR": "metadados"
	},
	description_localizations: {
		"pt-BR": "Extraia metadados de um arquivo PNG"
	},
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionType.Attachment,
			name: "image",
			description: "Image to get metadata from",
			name_localizations: {
				"pt-BR": "imagem"
			},
			description_localizations: {
				"pt-BR": "Imagem com os metadados"
			},
			required: true
		}
	]
}