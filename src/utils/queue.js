export default class Queue {
	#tasks = []
	#isBusy = false
	#lastId = 0

	add (task) {
		if (typeof task !== `function`)
			throw new TypeError(`Provided task is not a function`)

		const id = ++this.#lastId

		const request = new Promise((resolve, reject) => {
			this.#tasks.push({ task, id, resolve, reject })
		})

		if (!this.#isBusy)
			this.next()
		
		return { request, id }
	}
	async next () {
		this.#isBusy = true
		if (this.#tasks.length === 0) {
			this.#isBusy = false
			return
		}

		const { task, id, resolve, reject } = this.#tasks.shift() // single op to prevent race condition if queue is modified

		try {
			const result = await task()
			resolve(result)
		} catch (error) {
			reject(error)
		}

		return this.next()
	}
	async cancel (id) {
		const index = this.#tasks.findIndex(item => item.id === id)
		if (index === -1)
			return null
		return this.#tasks.splice(index, 1)
	}
	async clear () {
		this.#tasks.length = 0
	}
	get size () {
		return this.#tasks.length
	}
	get isBusy () {
		return this.#isBusy
	}
}