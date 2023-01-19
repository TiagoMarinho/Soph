import servers from '../distributed computing/serverlist.json' assert { type: 'json' }

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
	const buff = Buffer.from(servers[0].credentials, 'utf-8')
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