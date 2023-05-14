import data from './data.js'
import generate from '../../../shared/generate.js'
import { ApplicationCommandOptionType } from 'discord.js'

export default {
	data,
	async execute (interaction) {
		const parameters = {}
        for (const option of interaction.options.data) {
            parameters[option.name] = 
                option.type === ApplicationCommandOptionType.Attachment ? 
                    option.attachment : option.value
        }

        await generate(interaction, parameters)
	}
}