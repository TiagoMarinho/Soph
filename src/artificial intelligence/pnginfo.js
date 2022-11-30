export const parseParameters = textChunk => {
	const parts = textChunk.split(`\n`)
	const prompt = `Prompt: ${parts[0]}`
	const negative = parts[1]
	const settings = parts[2].split(`, `)

	const parameters = [prompt, negative, ...settings]

	const pngInfo = []
	
	for (const parameter of parameters) {
		const [key, value] = parameter.split(`: `)
		pngInfo.push({name: key, value: value})
	}
	return pngInfo
}