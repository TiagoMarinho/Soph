export class Port {
	constructor(node, name, index) {
		this.parent = node // parent node
		this.name = name
		this.index = index
		this.value = null // literal or Port
	}
}

export default class Node {
	id = null
	enabled = true
	constructor(type) {
		this.type = type
		this.title = type
		this.inputs = new Map() // name -> Port
		this.outputs = new Map() // name -> Port
	}

	addInputs(...names) {
		names.forEach(name => {
			this.inputs.set(name, new Port(this, name, this.inputs.size))
		})
		return this
	}

	addOutputs(...names) {
		names.forEach(name => {
			this.outputs.set(name, new Port(this, name, this.outputs.size))
		})
		return this
	}

	clone() {
		const clone = new Node(this.type)

		for (const name of this.inputs.keys())
			clone.addInputs(name)

		for (const name of this.outputs.keys())
			clone.addOutputs(name)

		return clone
	}

	toJSON() {
		return {
			inputs: Object.fromEntries(
				Array.from(this.inputs, ([name, port]) => [
					name,
					port.value instanceof Port
						? [String(port.value.parent.id), port.value.index]
						: port.value
				])
			),
			class_type: this.type,
			_meta: { title: this.title }
		}
	}
}