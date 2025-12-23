import config from '../../config.json' with { type: 'json' }
import { AttachmentBuilder } from 'discord.js'

export const uploadToCache = async (client, buffer, filename) => {
	if (!config.cacheChannelId) {
		console.warn("No cacheChannelId configured. Skipping cache.")
		return null
	}

	try {
		const channel = await client.channels.fetch(config.cacheChannelId)
		if (!channel) throw new Error("Cache channel not found")

		const file = new AttachmentBuilder(buffer, { name: filename })
		const message = await channel.send({ files: [file] })
		
		return message.attachments.first().url
	} catch (error) {
		console.error("Failed to upload to cache channel:", error)
		return null
	}
}