import data from './data.js'
import { EmbedBuilder } from "@discordjs/builders"

export default {
	data,
	async execute (interaction) {
		const reply = await interaction.deferReply({ fetchReply: true })
		const heartbeatPing = interaction.client.ws.ping
		const roundtripLatency = reply.createdTimestamp - interaction.createdTimestamp
	
		const embed = new EmbedBuilder()
			.addFields({ name: `Heartbeat ping`, value: `${heartbeatPing}ms` })
			.addFields({ name: `Roundtrip latency`, value: `${roundtripLatency}ms` })
	
		interaction.editReply({ embeds: [embed] })
	}
}