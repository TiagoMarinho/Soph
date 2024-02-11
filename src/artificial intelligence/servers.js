import Queue from "../utils/queue.js"

const servers = [
	{
		address: "http://127.0.0.1:7860",
		credentials: "username:password"
	}
]

for (const server of servers)
	server.queue = new Queue

export default servers