import { getRandomInt, wrap } from '../utils/math.js';
import requestImage from './requestimage.js';

import servers from './serverlist.json' assert { type: 'json' }

const requestBatch = async (
	batchCount = 4, 
	prompt = "",
	negativePrompt = "", 
	seed = -1, 
	initImage = null, 
	denoising = 0.75, 
	subseed = -1, 
	subseedStrength = 0.0, 
	steps = 30, 
	cfg = 11,
	width = 512,
	height = 512,
	sampler = `DPM++ 2M`,
	highresFix = false,
	firstphaseWidth = 512,
	firstphaseHeight = 512
) => {

	// get server with least overhead to generate
	const chosenServer = {
		address: null,
		credentials: null,
		eta: Infinity
	}
	for (const server of servers) {
		let isServerAvailable = true
		const buff = Buffer.from(server.credentials, 'utf-8')
		const base64Credentials = buff.toString('base64')

		const apiEndpoint = `${server.address}/sdapi/v1/progress`
		const request = await fetch(apiEndpoint, {
			method: 'get',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${base64Credentials}`
			}
		})

		const data = await request.json().catch(_ => {
			isServerAvailable = false
		})
		
		if (!isServerAvailable)
			continue

		const eta = Math.abs(data.eta_relative)

		if (chosenServer.eta < eta)
			continue

		chosenServer.address = server.address
		chosenServer.credentials = base64Credentials
		chosenServer.eta = eta

		if (chosenServer.eta === 0)
			break
	}

	console.log(`${chosenServer.address} was chosen to generate`)

	// batch:

	const randomizedSeed = getRandomInt(1_000_000_000, 9_999_999_999)
	
	const groups = prompt.match(/\{.+?\}/g)?.map(str => str.slice(1,-1).split(`|`))
	const negativeGroups = negativePrompt.match(/\{.+?\}/g)?.map(str => str.slice(1,-1).split(`|`))

	const requests = []
	for (let i = batchCount - 1; i >= 0; --i) {
		const finalSeed = seed === -1 ? randomizedSeed + i : seed

		let matchPos = 0
		const finalPrompt = groups ? prompt.replace(/\{.+?\}/g, _ => {
			const variationGroup = groups[matchPos]
			const variation = variationGroup[wrap(i, variationGroup.length)].trim()
			++matchPos
			return variation
		}) : prompt
		
		let matchPosNegative = 0
		const finalNegativePrompt = negativeGroups ? negativePrompt.replace(/\{.+?\}/g, _ => {
			const variationGroup = negativeGroups[matchPosNegative]
			const variation = variationGroup[wrap(i, variationGroup.length)].trim()
			++matchPosNegative
			return variation
		}) : negativePrompt

		const request = requestImage(
			chosenServer,
			finalPrompt,
			finalNegativePrompt,
			finalSeed,
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
			firstphaseWidth,
			firstphaseHeight
		)
		requests.push(request)
	}
	return requests
}

export default requestBatch