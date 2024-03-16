const response = await fetch("http://127.0.0.1:7860/sdapi/v1/sd-models", {
	method: 'get',
	headers: {
		'Content-Type': 'application/json'
	}
})

let data = await response.json()

if (!Array.isArray(data)) {
	console.warn('could not get models, /v1/sd-models did not return an array. Response:\n', data)
	data = []
}

export default data