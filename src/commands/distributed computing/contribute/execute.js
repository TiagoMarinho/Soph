import { EmbedBuilder } from "@discordjs/builders"
import colors from '../../../colors.json' assert { type: 'json' }
import loadBalancingManager from "../../../distributed computing/loadbalancingmanager.js"

const contribute = async interaction => {
	await interaction.deferReply({ ephemeral: true })

	const address = interaction.options.getString(`address`)
	const username = interaction.options.getString(`username`)
	const password = interaction.options.getString(`password`)

	if (interaction.user.id !== `282942872561385473`)
		return interaction.editReply(`Not allowed`)

	loadBalancingManager.addServer(address, `${username}:${password}`)

	return interaction.editReply(`Added new contributor`)
}
export default contribute