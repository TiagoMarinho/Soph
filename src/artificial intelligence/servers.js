import Queue from "../utils/queue.js"

const defaultServer = {
	queue: new Queue(),
	address: null,
	credentials: null
}
const servers = [
	{
		...defaultServer,
		address: "http://127.0.0.1:7860",
		credentials: "username:password"
	}
]

export default servers