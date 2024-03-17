import data from './data.js'
import config from '../../../../config.json' assert { type: 'json' }
import { ChatInputCommandInteraction } from 'discord.js'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { getFormattedLocalizedText, getLocalizedText } from '../../../locale/languages.js'

export default {
	data,
	/** @param {ChatInputCommandInteraction} interaction */
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand(true)
		switch (subcommand) {
			case 'add':
				addLora(interaction)
				break
			default:
				break
		}
	},
}

/** @param {ChatInputCommandInteraction} interaction */
const addLora = async interaction => {
	const url = interaction.options.getString('url', true)
	const apiKey = config.civitaiAPIKey
	const destination = config.loraFolderPath

	let customFileName = interaction.options.getString('filename') ?? ''

	// no destination path or api key.
	if (!destination || !apiKey) {
		if (!destination) console.log('no lora path set. Please set the "loraFolderPath" in the config.json')
		if (!apiKey) console.log('no civitai apikey. Please set the "civitaiAPIKey" in the config.json')

		return interaction.reply({
			content: getLocalizedText('lora generic error', interaction.locale),
			ephemeral: true,
		})
	}

	const modelIdMatch = url.match(/\/models\/(\d+)/)

	// no model id found or invalid url.
	if (!url.startsWith('https://civitai.com/') || !modelIdMatch)
		return interaction.reply({
			content: getLocalizedText('lora invalid link', interaction.locale),
			ephemeral: true,
		})

	const modelId = modelIdMatch[1]

	await interaction.deferReply()

	// get model info
	const modelData = await fetch(`https://civitai.com/api/v1/models/${modelId}`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
	})
		.then((res) => res.json())
		.catch((err) => {
			console.log('could not fetch the model, error:\n', err)
		})

	if (!modelData)
		return interaction.editReply({
			content: getLocalizedText('lora generic error', interaction.locale),
			ephemeral: true,
		})

	if (modelData.type !== 'LORA')
		return interaction.editReply({
			content: getLocalizedText('lora wrong type', interaction.locale),
			ephemeral: true,
		})

	// get download url.
	const downloadUrl = modelData.modelVersions[0].downloadUrl + '?token=' + apiKey
	const downloadUrlWithoutToken = modelData.modelVersions[0].downloadUrl

	// check if destination folder exists, create it if not.
	if (!fs.existsSync(destination)) {
		fs.mkdirSync(destination, { recursive: true })
	}

	// downloading...
	console.log(`downloading ${modelData.name}...`)
	console.log('url:', downloadUrlWithoutToken)

	const downloadRes = await fetch(downloadUrl).catch((err) => {
		console.log('failed to fetch the download link, error:\n', err)
	})

	if (!downloadRes || !downloadRes.ok) {
		if (downloadRes) console.log('failed to fetch the download link:', downloadRes.statusText)

		return interaction.editReply({
			content: getLocalizedText('lora generic error', interaction.locale),
			ephemeral: true,
		})
	}

	// add .safetensors if the custom file name doesn't end with .safetensors
	if (customFileName && !customFileName.endsWith('.safetensors')) customFileName += '.safetensors'

	// remove characters that might be problematic when prompting
	customFileName = (() => {
		if (!customFileName) return ''
		let noExt = customFileName.replace('.safetensors', '')
		noExt = noExt.replace(/[^a-z0-9-_]/gi, '_')
		return noExt + '.safetensors'
	})()

	const filename = (() => {
		// use custom file name.
		if (customFileName) return customFileName

		// use content-disposition header
		const fileNameFromResponse = getFileNameFromResponse(downloadRes)
		if (fileNameFromResponse) return fileNameFromResponse

		// use id
		return `${modelId}.safetensors`
	})()

	// check if custom file name already exists in the lora folder.
	const fileExists = (() => {
		const files = fs.readdirSync(destination)
		return files.includes(filename)
	})()

	if (fileExists)
		return interaction.editReply({
			content: getLocalizedText('lora already exist', interaction.locale),
			ephemeral: true,
		})

	const filePath = await downloadFileFromResponse(downloadRes, destination, filename).catch((err) => {
		console.log('could not download the file, error:\n', err)
	})

	if (!filePath)
		return interaction.editReply({
			content: getLocalizedText('lora generic error', interaction.locale),
		})
	
	console.log('download done!')

	const fileNameWithoutExt = filename.replace('.safetensors', '')

	// done
	interaction.editReply({
		content: getFormattedLocalizedText('lora add success', interaction.locale, fileNameWithoutExt),
	})
}

const getFileNameFromResponse = (res) => {
	const contentDisposition = res.headers.get('content-disposition')
	if (contentDisposition && contentDisposition.includes('filename=')) {
		const match = contentDisposition.match(/filename="(.+)"/)
		if (match) return match[1]
	}

	return ''
}

const downloadFileFromResponse = async (res, destination, filename) => {
	const filePath = path.join(destination, filename)

	const fileStream = fs.createWriteStream(filePath)

	return new Promise((resolve, reject) => {
		res.body.pipe(fileStream)
		res.body.on('error', (err) => {
			fs.unlink(filePath, () => {}) // delete the file async if an error occurs
			reject(err)
		})
		fileStream.on('finish', () => {
			resolve(filePath) // resolve full file path
		})
		fileStream.on('error', (err) => {
			fs.unlink(filePath, () => {}) // delete the file async if an error occurs
			reject(err)
		})
	})
}

const downloadFileFromUrl = async (url, destination, filename) => {
	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
	}

	return downloadFileFromResponse(res, destination, filename)
}
