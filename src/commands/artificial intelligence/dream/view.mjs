import { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, TextDisplayBuilder } from "discord.js"

export const buildMessage = (completedUrls, currentBuffer, stats, baseSeed) => {
	const galleryItems = []
	const files = []

	completedUrls.forEach(url => {
		galleryItems.push({ media: { url } })
	})

	if (currentBuffer) {
		const name = `preview.png`
		files.push(new AttachmentBuilder(currentBuffer, { name }))
		galleryItems.push({ media: { url: `attachment://${name}` } })
	}

	const statusText = stats.isComplete ? "time elapsed" : "generating"
	
	const footer = new TextDisplayBuilder({
		content: `-# seed: \`${baseSeed}\` ${statusText}: \`${stats.seconds}s\` it/s: \`${stats.speed}\``
	})

	const gallery = new MediaGalleryBuilder({ items: galleryItems })
	const container = new ContainerBuilder({ components: [gallery, footer] })

	return {
		files,
		components: [container],
		flags: MessageFlags.IsComponentsV2
	}
}