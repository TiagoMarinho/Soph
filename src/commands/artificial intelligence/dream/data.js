import { ApplicationCommandType } from "discord.js";
import { optionalOptions, requiredOptions } from "../../../shared/base-options.js";

export default {
    name: "dream",
    description: "Generate images using artificial intelligence",
    name_localizations: {
        "pt-BR": "sonhar"
    },
    description_localizations: {
        "pt-BR": "Gerar imagens usando inteligência artificial"
    },
	type: ApplicationCommandType.ChatInput,
	options: [
		...requiredOptions,
		...optionalOptions
	]
}