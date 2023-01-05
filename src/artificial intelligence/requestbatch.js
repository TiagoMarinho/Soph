import { getRandomInt } from '../utils/math.js';
import Queue from '../utils/queue.js';
import requestImage from './requestimage.js';

const getPromptVariation = (prompt, position) => {
	const insideCurlyBracesRegex = /\{.+?\}/g
	const parts = prompt?.split(insideCurlyBracesRegex)
	const groups = prompt?.match(insideCurlyBracesRegex)?.map(str => str.slice(1, -1).split(`|`))

	if (!groups)
		return prompt

	const variations = groups.map(group => group[position % group.length])

	const promptVariation = parts.reduce((result, part, index) => {
		const variation = variations[index] ?? ``
		return result + part + variation
	}, "")

	return promptVariation
}

const batchQueue = new Queue()

const requestBatch = async (
	batchCount = 4, 
	prompt,
	negativePrompt, 
	seed,
	initImage,
	denoising,
	subseed,
	subseedStrength,
	steps,
	cfg,
	width,
	height,
	sampler,
	highresFix,
	hrScale,
	latentSpace,
	clipSkip,
) => {

	const randomSeed = getRandomInt(1_000_000_000, 9_999_999_999) // 10 digits
	
	const dynamicParameters = new Array(batchCount).fill()
		.map((_, i) => ({
			prompt: getPromptVariation(prompt, i),
			negativePrompt: getPromptVariation(negativePrompt, i),
			seed: seed ?? randomSeed + i,
		}))

	const requests = dynamicParameters
		.map(async dynamicData => 
			await batchQueue.add(_ => requestImage(
				dynamicData.prompt,
				dynamicData.negativePrompt,
				dynamicData.seed,
				initImage,
				denoising,
				subseed,
				subseedStrength,
				steps,
				cfg,
				width,
				height,
				sampler,
				highresFix,
				hrScale,
				latentSpace,
				clipSkip,
			))
		)

	return requests
}

export default requestBatch