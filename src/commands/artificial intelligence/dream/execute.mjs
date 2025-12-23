import defaultParams from "../../../artificial intelligence/default-sd-params.mjs"
import promptPrefixes from "../../../artificial intelligence/prompt-prefixes.json" with { type: 'json' }
import { GenerationJob } from "../../../artificial intelligence/generation-job.mjs"
import { buildMessage } from "./view.mjs"
import { getRandomInt } from "../../../utils/math.mjs"
import { uploadToCache } from "../../../utils/discord-cache.mjs"

const normalizeParameters = (interaction) => {
	const inputs = Object.fromEntries(interaction.options.data.map(o => [o.name, o.value]))
	const raw = { ...defaultParams, ...inputs }

	let { prompt, negative_prompt } = raw
	if (raw.prompt_prefix) {
		const p = promptPrefixes[raw.prompt_prefix]
		prompt = [p.promptPrefix, prompt].join(", ")
		negative_prompt = [p.negativePromptPrefix, negative_prompt].join(", ")
	}
	const seed = raw.seed ?? getRandomInt(0, 9_999_999_999);

	return {
		...raw,
		prompt,
		negative_prompt,
		seed,
		batchCount: raw.batch || 1,
		batch: 1
	}
}

export default async interaction => {
	await interaction.deferReply()

	const params = normalizeParameters(interaction)
	const job = new GenerationJob(params)
	
	const completedUrls = []

	await job.run(async (buffer, stats, seed, isCurrentFinal) => {
		
		let currentBuffer = buffer

		if (isCurrentFinal) {
			const filename = `Soph_${stats.finishedIndex}.png`
			const url = await uploadToCache(interaction.client, buffer, filename)
			
			if (url) {
				completedUrls.push(url)
				currentBuffer = null
			}
		}
		
		const payload = buildMessage(completedUrls, currentBuffer, stats, seed)
		await interaction.editReply(payload)
	})
}