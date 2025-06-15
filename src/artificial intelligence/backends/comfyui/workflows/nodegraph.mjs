import nodeDefinitions from "./node-definitions.json" assert { type: 'json' }
import Node from "./node.mjs"

export default class NodeGraph {
	_idCount = 0
	constructor() {
		this.nodes = []
	}

	add(...nodes) {
		for (const node of nodes)
			node.id = ++this._idCount
		this.nodes.push(...nodes)
		return this
	}

	// feed an input port from an output port
	connect(fromPort, toPort) {
		toPort.value = fromPort
		return this
	}

	// feed an input port from a literal value
	setValue(toPort, literal) {
		toPort.value = literal
		return this
	}

	toJSON() {
		return Object.fromEntries(
			this.nodes
				.filter(node => node.enabled)
				.map(node => [node.id, node.toJSON()])
		)
	}
}

export const BaseNodes = Object.fromEntries(
	Object.entries(nodeDefinitions).map(([type, { inputs, outputs }]) => {
		const proto = new Node(type)
			.addInputs(...inputs)
			.addOutputs(...outputs)
		return [type, proto]
	})
)

export const NodeFactory = new Proxy(BaseNodes, {
	get(_, type) {
		if (!(type in BaseNodes))
			throw new Error(`Unknown node type: ${type}`)
		return BaseNodes[type].clone()
	}
})