import Queue from "../utils/queue.js"
import serverList from './serverlist.json' assert { type: 'json' }

class Server {
	address = null
	credentials = null
	queue = new Queue()
	isDown = false

	constructor (address, credentials) {
		this.address = address
		this.credentials = credentials
	}
}

const loadBalancingManager = {
	serverList: [],
	addServer (address, credentials) {
		const newServer = {
			address,
			credentials,
			queue: new Queue(),
		}
		this.serverList.push(newServer)
	},
	getLeastLoadedServer () {
		return this.serverList.reduce((leastLoadedServer, currentServer) => 
			currentServer.queue.size > leastLoadedServer?.queue.size ? 
			leastLoadedServer : 
			currentServer
		)
	},
}

for (const server of serverList) {
	loadBalancingManager.addServer(server.address, server.credentials)
}

export default loadBalancingManager