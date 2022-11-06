import fs from 'node:fs'

import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// FIXME: Improve naming

const getCommandsByCategory = async _ => {
	const categoriesPath = path.join(__dirname, 'commands')
	const categories = fs.readdirSync(categoriesPath)

	const commandsByCategory = {}
	for (const category of categories) {
		const categoryPath = path.join(categoriesPath, category)
		const commands = await getCommands(categoryPath)

		commandsByCategory[category] = commands
	}
	return commandsByCategory
}

// takes path to command directories and returns array of command objects
const getCommands = async categoryPath => {
	const commandFolderNames = fs.readdirSync(categoryPath)
	const commandFolderPaths = commandFolderNames
		.map(commandFolderName => 
			path.join(categoryPath, commandFolderName)
		)
	
	const commands = []
	for (const commandFolderPath of commandFolderPaths) {

		const command = await buildCommand(commandFolderPath)
		commands.push(command)
	}

	return commands
}

// takes path to data.json and execute.js and turns it into an object
const buildCommand = async commandFolderPath => {
	const dataPath = path.join(commandFolderPath, `data.json`)
	const { default: data } = 
		await import(`file://${dataPath}`, {
			assert: { type: "json" }
		})

	const executePath = path.join(commandFolderPath, `execute.js`)
	const { default: execute } = await import(`file://${executePath}`)

	return {data, execute}
}

export default getCommandsByCategory