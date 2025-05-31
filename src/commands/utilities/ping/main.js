import { timer } from '../../../utils/timing.js'
import data from './data.js'
import { EmbedBuilder } from "@discordjs/builders"
import colors from '../../../colors.json' assert { type: 'json' }
import emojis from '../../../emojis.json' assert { type: 'json' }

function hexStringToNumber(hex) {
	if (hex[0] === '#') hex = hex.slice(1);
	return parseInt(hex, 16);
}

export default {
	data,
	async execute(interaction) {
		const reply = await interaction.deferReply({ fetchReply: true })
		const heartbeatPing = interaction.client.ws.ping
		const roundtripLatency = reply.createdTimestamp - interaction.createdTimestamp
		const latencies = [roundtripLatency]

		const SAMPLE_INTERVAL = 1000
		const SAMPLE_COUNT = interaction.options.getNumber("samples") ?? 1

		const BOLD_THRESHOLD = 700

		for (let i = 0; i < SAMPLE_COUNT; i++) {
			await timer(SAMPLE_INTERVAL)
			const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
			const minimumLatency = Math.min(...latencies)
			const maximumLatency = Math.max(...latencies)
			const latencyList = 
				latencies
					.map(latency => {
						const bold = latency > BOLD_THRESHOLD ? "**" : ""
						const underline = latency === maximumLatency ? "__" : ""
						return underline + bold + "`" + latency.toFixed(0) + "ms`" + bold + underline
					})
					.join(" ")

			const color = i + 1 === SAMPLE_COUNT ? (maximumLatency > BOLD_THRESHOLD ? colors.issue : colors.complete) : colors.incomplete
			const emoji = maximumLatency > BOLD_THRESHOLD ? ` <:issue:${emojis.issue}>` : ``
			const embed = new EmbedBuilder()
				.setColor(hexStringToNumber(color))
				.addFields({ name: "Heartbeat ping", value: `${heartbeatPing}ms`, inline: false, })
				.addFields({ name: "Average", value: `${averageLatency.toFixed(0)}ms`, inline: true, })
				.addFields({ name: "Minimum", value: `${minimumLatency.toFixed(0)}ms`, inline: true, })
				.addFields({ name: "Maximum", value: `${maximumLatency.toFixed(0)}ms${emoji}`, inline: true, })
				.addFields({ name: "Samples performed", value: `${i + 1} out of ${SAMPLE_COUNT}`, inline: false, })
			if (SAMPLE_COUNT > 1)
				embed
					.addFields({ name: "Individual samples", value: latencyList, inline: false, })

			// Capture timestamp right before editing the reply
			const beforeEdit = performance.now()
			await interaction.editReply({ embeds: [embed] })
			// Use current time after edit to calculate latency
			const latency = performance.now() - beforeEdit
			
			latencies.push(latency)
		}
	}
}