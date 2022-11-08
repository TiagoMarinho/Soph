const upscale = async (
	imageBuffer,
	resizeFactor = 2,
	upscaler1 = `R-ESRGAN 4x+ Anime6B`
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
		"upscaler_2": "None",
		"extras_upscaler_2_visibility": 0,
		"upscale_first": false,
		"image": base64InputImage
	}
	const apiEndpoint = `http://127.0.0.1:7860/sdapi/v1/extra-single-image`
	const response = await fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {'Content-Type': 'application/json'}
	})
	const data = await response.json()
	const resultBuffer = Buffer.from(data.image, "base64")

	return resultBuffer
}

export default upscale