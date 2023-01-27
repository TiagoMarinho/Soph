import loadBalancingManager from "../distributed computing/loadbalancingmanager.js"

const interrogate = async (
	imageBuffer,
	model = 'deepdanbooru'
) => {
	const base64InputImage = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
	const payload = {
		"image": base64InputImage,
		"model": model
	}
	const server = loadBalancingManager.getLeastLoadedServer()
	const apiEndpoint = `${server.address}/sdapi/v1/interrogate`
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

	return data
}

export default interrogate