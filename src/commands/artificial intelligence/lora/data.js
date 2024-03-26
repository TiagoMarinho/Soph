import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js'

export default {
	name: 'lora',
	type: ApplicationCommandType.ChatInput,
	description: "Manage LoRA's",
	description_localizations: {
		'pt-BR': "Gerenciar LoRA's",
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'Add a new LoRA using a civit.ai URL',
			description_localizations: {
				'pt-BR': 'Adiciona LoRA usando uma URL do civit.ai',
			},
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'url',
					description: 'URL of the LoRA file',
					description_localizations: {
						'pt-BR': 'URL do arquivo LoRA',
					},
					required: true,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'filename',
					name_localizations: {
						'pt-BR': 'nome',
					},
					description: 'Custom name for the file',
					description_localizations: {
						'pt-BR': 'Nome personalizado para o arquivo',
					},
					required: false,
					max_length: 30
				},
			],
		},
	],
}
