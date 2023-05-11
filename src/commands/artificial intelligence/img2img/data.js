import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { optionalOptions, requiredOptions } from "../../../shared/base-options.js"

export default {
    name: "img2img",
	description: "Generate images inspired by another image",
	description_localizations: {
		"pt-BR": "Gerar imagens inspiradas em outra imagem"
	},
    type: ApplicationCommandType.ChatInput,
    options: [
        ...requiredOptions,
        {
            type: ApplicationCommandOptionType.Attachment,
            name: "image",
            description: "Image to use as input",
            name_localizations: {
                "pt-BR": "imagem"
            },
            description_localizations: {
                "pt-BR": "Usar uma imagem para guiar o resultado"
            },
            required: true
        },
        ...optionalOptions
    ]
}