import crypto from 'crypto'
import { EventEmitter } from 'events'

export default class Queue {
	#tasks = []
	#isBusy = false
	eventEmitter = new EventEmitter()

	add (task) {
		if (typeof task !== `function`)
			throw new TypeError(`Provided task is not a function`)

		const id = crypto.randomBytes(10).toString('hex')

		const request = new Promise((resolve, reject) => {
			this.#tasks.push({ id, task, resolve, reject, queue: this, inProgress: false })
		})

		if (!this.#isBusy)
			this.next()

		return { id, request, queue: this }
	}
	async next () {
		this.#isBusy = true
		if (this.#tasks.length === 0) {
			this.#isBusy = false
			return
		}

		const job = this.#tasks.shift() // single op to prevent race condition if queue is modified
		const { task, resolve, reject } = job

		job.inProgress = true
		try {
			const result = await task()
			resolve(result)
		} catch (error) {
			reject(error)
		}
		job.inProgress = false
		
		this.eventEmitter.emit('next', job)

		return this.next()
	}
	clear () {
		this.#tasks.length = 0
	}
	get size () {
		return this.#tasks.length
	}
	get isBusy () {
		return this.#isBusy
	}
	getPosition (id) {
		return this.#tasks.findIndex(task => task.id === id)
	}
	cancel (id) {
		const index = this.getPosition(id)
		if (index === -1) return
		this.#tasks.splice(index, 1)
	}
}