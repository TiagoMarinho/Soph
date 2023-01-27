import loadBalancingManager from "../distributed computing/loadbalancingmanager.js"

export const parseParameters = async imageBuffer => {

	const server = loadBalancingManager.getLeastLoadedServer()
	
	const base64InputImage = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
	const payload = {
		"image": base64InputImage
	}
	const apiEndpoint = `${server.address}/sdapi/v1/png-info`
	const buff = Buffer.from(server.credentials, 'utf-8')
	const base64Credentials = buff.toString('base64')
	const response = await fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${base64Credentials}`
		}
	})
	const data = await response.json()
	
	if (!data.info?.length)
		return []

	const parts = data.info.split(`\n`)
	const negativePromptStartIndex = parts.findLastIndex(item => item.startsWith(`Negative prompt:`))

	const prompt = `Prompt: ${parts.slice(0, negativePromptStartIndex).join(`\n`)}`
	const negative = parts.slice(negativePromptStartIndex, -1).join(`\n`)
	const settings = parts.at(-1).split(`, `)

	const parameters = [prompt, negative, ...settings]

	const pngInfo = []
	
	for (const parameter of parameters) {
		const [key, value] = parameter.split(`: `)
		pngInfo.push({ name: key, value: value })
	}
	return pngInfo
}