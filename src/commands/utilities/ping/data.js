import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

export default {
	name: "ping",
	description: "Measure the bot's latency",
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionType.Number,
			name: "samples",
			description: "How many times to sample the latency",
			description_localizations: {
				"pt-BR": "Quantas vezes testar a latência"
			},
			required: false,
			min_value: 1,
			max_value: 10
		}
	],
}