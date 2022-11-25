import servers from './serverlist.json' assert { type: 'json' }

const interrogate = async (
	imageBuffer,
	model = 'deepdanbooru'
) => {
	const base64InputImage = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
	const payload = {
		"image": base64InputImage,
		"model": model
	}
	const apiEndpoint = `${servers[0].address}/sdapi/v1/interrogate`
	const response = await fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {'Content-Type': 'application/json'}
	})
	const data = await response.json()

	return data
}

export default interrogate