// This file generate the config.json file after running `npm install`

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, 'config.json')

if (fs.existsSync(configPath)) {
  // skip if already exist.
  process.exit(0)
}

const config = {
  token: 'ADD_YOUR_TOKEN_HERE',
  clientId: 'ADD_YOUR_CLIENT_ID_HERE',
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

console.log('Config file generated in config.json')