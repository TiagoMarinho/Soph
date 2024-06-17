import { Events } from 'discord.js'
import asciiart from '../asciiart.js'

export default {
	name: Events.ClientReady,
	once: true,
	execute (client) {
		console.log(asciiart)
		console.log(`Ready! Logged in as ${client.user.tag}`)
	},
}