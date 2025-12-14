import { Client, GatewayIntentBits, Collection } from 'discord.js'
import config from '../config.json' with { type: 'json' }
import fs from 'node:fs'

import getCommandsByCategory from './get-commands.mjs'

import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const soph = {
	client: new Client({ intents: [GatewayIntentBits.Guilds] }),
	async loadEvents () {
		const eventsPath = path.join(__dirname, 'events')
		const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.mjs'))

		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file)
			const {default: event} = await import(`file://${filePath}`)

			const methodName = event.once ? `once` : `on`
			this.client[methodName](event.name, (...args) => event.execute(...args))
		}
	},
	async loadCommands () {
		this.client.commands = new Collection()

		const commandsByCategory = await getCommandsByCategory()

		for (const categoryName of Object.keys(commandsByCategory)) {
			for (const command of commandsByCategory[categoryName]) {
				this.client.commands.set(command.data.name, command)
			}
		}
	},
	run () {
		this.loadEvents()
		this.loadCommands()
		this.client.login(config.token)

		return this
	}
}
soph.run()