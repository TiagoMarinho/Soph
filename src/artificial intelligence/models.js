const response = await fetch("http://127.0.0.1:7860/sdapi/v1/sd-models", {
	method: 'get',
	headers: {
		'Content-Type': 'application/json'
	}
})

const data = await response.json()

const isDataAnArray = Array.isArray(data)
console.assert(isDataAnArray, `Could not get models, /v1/sd-models did not return an array. Response:\n${data}`)

export default isDataAnArray ? data : []