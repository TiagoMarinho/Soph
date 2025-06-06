import fs from 'node:fs'

import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getCommandsByCategory = async _ => {
	const categoriesPath = path.join(__dirname, 'commands')
	const categories = fs.readdirSync(categoriesPath)

	const commandsByCategory = {}
	for (const category of categories) {
		const categoryPath = path.join(categoriesPath, category)
		const commands = await getCommandsFromFolder(categoryPath)

		commandsByCategory[category] = commands
	}
	return commandsByCategory
}

const getCommandsFromFolder = async folder => {
	const commandFolderNames = fs.readdirSync(folder)
	const commandPaths = commandFolderNames
		.map(commandFolderName => 
			path.join(folder, commandFolderName, `main.mjs`)
		)
	
	const commands = commandPaths.map(async commandPath => {
		const { default: command } = await import(`file://` + commandPath)
		return command
	})

	return Promise.all(commands)
}

export default getCommandsByCategory