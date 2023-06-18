const response = await fetch("http://127.0.0.1:7860/sdapi/v1/sd-models", {
	method: 'get',
	headers: {
		'Content-Type': 'application/json'
	}
})
const data = await response.json()

export default data