import { Events, EmbedBuilder } from 'discord.js'
import servers from '../artificial intelligence/serverlist.json' assert {type: 'json'}

const buff = Buffer.from(servers[0].credentials, 'utf-8')
const base64Credentials = buff.toString('base64')

// loading controlnet models
const controlNetModels = []
fetch(`${servers[0].address}/controlnet/model_list`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${base64Credentials}`
        }
    }
).then(res => res.json())
.then(data => {
    if (!data.model_list) throw new Error('empty list')

    controlNetModels.push(...data.model_list)
}).catch(err => console.log('could not get list of controlnet models:\n', err))


// loading controlnet modules
const controlNetModules = []
fetch(`${servers[0].address}/controlnet/module_list`, {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Credentials}`
    }
}
).then(res => res.json())
.then(data => {
    if (!data.module_list) throw new Error('empty list')

    controlNetModules.push(...data.module_list)
}).catch(err => console.log('could not get list of controlnet modules:\n', err))

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isAutocomplete()) return

        const focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'controlnet-model') {
            return interaction.respond(
                controlNetModels.map(choice => ({ name: choice, value: choice })),
            );
        }

        if (focusedOption.name === 'controlnet-module') {
            return interaction.respond(
                controlNetModules
                    .filter(choice => choice.startsWith(focusedOption.value))
                    .map(choice => ({ name: choice, value: choice }))
                    .slice(0, 25)
            );
        }
	},
}