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
	const destination = config.loraFolderPath
	let customFileName = interaction.options.getString('filename') ?? ''

	// no destination path.
	if (!destination)
		return interaction.reply({
			content: getLocalizedText('lora path missing', interaction.locale),
			ephemeral: true,
		})

	// validate url
	if (!url.match(/^https:\/\/civitai.com\/api\/download\/models\/(\d+)(\?.+)?/))
		return interaction.reply({
			content: getLocalizedText('lora invalid link', interaction.locale),
			ephemeral: true,
		})

	// remove characters that might be problematic when prompting
	customFileName = customFileName?.replace(/[^a-z0-9-_]/gi, '_')

	// check if destination folder exists, create it if not
	if (!fs.existsSync(destination)) {
		fs.mkdirSync(destination, { recursive: true })
	}

	// check if file already exists
	const fileExist = (() => {
		if (!customFileName) return false

		const customNameNoExt = customFileName.substring(0, customFileName.lastIndexOf('.')) || customFileName // remove extension
		const files = fs.readdirSync(destination)

		return files.some((file) => {
			const fileWithoutExtension = file.substring(0, file.lastIndexOf('.')) // remove extension of each file
			return fileWithoutExtension === customNameNoExt
		})
	})()

	if (fileExist)
		return interaction.reply({
			content: getLocalizedText('lora already exist', interaction.locale),
			ephemeral: true,
		})

	await interaction.deferReply()

	// download the file...
	let fileName = ''

	try {
		fileName = await downloadFile(url, destination, customFileName)
	} catch (err) {
		return interaction.editReply({
			content: `${getLocalizedText('lora generic error', interaction.locale)}\n> \`${err}\``,
		})
	}

	const fileNameNoExt = fileName.replace(/\..+$/, '')

	// send successful message.
	interaction.editReply({
		content: getFormattedLocalizedText('lora add success', interaction.locale, fileNameNoExt),
	})
}

const downloadFile = async (url, destination, customFileName = '') => {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
	}

	// get filename
	let fileName = ''
	const contentDisposition = response.headers.get('content-disposition')
	if (contentDisposition && contentDisposition.includes('filename=')) {
		const match = contentDisposition.match(/filename="(.+?)"/)
		if (match) {
			fileName = match[1]
		}
	}

	if (!fileName) {
		fileName = url.substring(url.lastIndexOf('/') + 1)
	}

	// set custom file name
	fileName = (() => {
		if (!customFileName) return fileName
		const ext = fileName.split('.').at(-1) || ''

		if (customFileName.includes('.')) return customFileName
		if (!ext) return customFileName
		return customFileName + '.' + ext
	})()

	const filePath = path.join(destination, fileName)

	const fileStream = fs.createWriteStream(filePath)

	return new Promise((resolve, reject) => {
		response.body.pipe(fileStream)
		response.body.on('error', (err) => {
			fs.unlink(filePath, () => {}) // delete the file async if an error occurs
			reject(err)
		})
		fileStream.on('finish', () => {
			resolve(path.basename(filePath)) // resolve file name
		})
		fileStream.on('error', (err) => {
			fs.unlink(filePath, () => {}) // delete the file async if an error occurs
			reject(err)
		})
	})
}
