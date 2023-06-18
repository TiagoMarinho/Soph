import servers from './servers.js'

const upscale = async (
	imageBuffer,
	resizeFactor = 2,
	upscaler1 = `R-ESRGAN 4x+ Anime6B`,
	upscaler2 = `None`,
	mixFactor = 0.5
) => {
	const base64InputImage = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
	const payload = {
		"resize_mode": 0,
		"show_extras_results": true,
		"gfpgan_visibility": 0,
		"codeformer_visibility": 0,
		"codeformer_weight": 0,
		"upscaling_resize": resizeFactor,
		//"upscaling_resize_w": 512,
		//"upscaling_resize_h": 512,
		"upscaling_crop": true,
		"upscaler_1": upscaler1,
		"upscaler_2": upscaler2,
		"extras_upscaler_2_visibility": mixFactor,
		"upscale_first": false,
		"image": base64InputImage
	}
	const apiEndpoint = `${servers[0].address}/sdapi/v1/extra-single-image`
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
	const resultBuffer = Buffer.from(data.image, "base64")

	return resultBuffer
}

export default upscale