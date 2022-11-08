import { getRandomInt, wrap } from '../utils/math.js';
import requestImage from './requestimage.js';

const requestBatch = async (
	batchCount = 4, 
	prompt = "",
	negativePrompt = "", 
	seed = -1, 
	initImage = null, 
	denoising = 0.75, 
	subseed = -1, 
	subseedStrength = 0.0, 
	steps = 35, 
	cfg = 11,
	width = 512,
	height = 512,
	sampler = `Euler`
) => {

	const randomizedSeed = getRandomInt(1_000_000_000, 9_999_999_999)
	
	const groups = prompt.match(/\{.+?\}/g)?.map(str => str.slice(1,-1).split(`|`))

	const requests = []
	for (let i = batchCount - 1; i >= 0; --i) {
		const finalSeed = seed === -1 ? randomizedSeed + i : seed

		let matchPos = 0
		const finalPrompt = groups ? prompt.replace(/\{.+?\}/g, _ => {
			const variationGroup = groups[matchPos]
			const variation = variationGroup[wrap(i, variationGroup.length)]
			++matchPos
			return variation
		}) : prompt

		const request = requestImage(
			finalPrompt,
			negativePrompt,
			finalSeed,
			initImage,
			denoising,
			subseed,
			subseedStrength,
			steps,
			cfg,
			width,
			height,
			sampler
		)
		requests.push(request)
	}
	return requests
}

export default requestBatch