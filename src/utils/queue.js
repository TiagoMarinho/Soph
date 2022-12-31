export default class Queue {
	#tasks = []
	#isBusy = false

	async add (task) {
		if (typeof task !== `function`)
			throw new TypeError(`Provided task is not a function`)

		const request = new Promise((resolve, reject) => {
			this.#tasks.push({ task, resolve, reject })
		})

		if (!this.#isBusy)
			this.next()

		return request
	}
	async next () {
		this.#isBusy = true
		if (this.#tasks.length === 0) {
			this.#isBusy = false
			return
		}

		const { task, resolve, reject } = this.#tasks.shift() // single op to prevent race condition if queue is modified

		try {
			const result = await task()
			resolve(result)
		} catch (error) {
			reject(error)
		}

		return this.next()
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