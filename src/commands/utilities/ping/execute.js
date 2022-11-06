import { EmbedBuilder } from "@discordjs/builders"

const ping = async interaction => {
	const reply = await interaction.deferReply({ fetchReply: true })
	const heartbeatPing = interaction.client.ws.ping
	const roundtripLatency = reply.createdTimestamp - interaction.createdTimestamp

	const embed = new EmbedBuilder()
		.setColor(0x2E8B21)
		.addFields({ name: `Heartbeat ping`, value: `${heartbeatPing}ms` })
		.addFields({ name: `Roundtrip latency`, value: `${roundtripLatency}ms` })

	interaction.editReply({ embeds: [embed] })
}
export default ping