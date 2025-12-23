import { Node, Port } from "./elements.mjs";

export const createNodeFactory = (typeName, definition) => (props) => {
	const bypassKey = definition.bypass || definition.inputs[0];

	const node = new Node(typeName, props, bypassKey);

	if (definition.outputs.length === 0) {
		return node;
	}

	const ports = {};
	definition.outputs.forEach((outputName, index) => {
		ports[outputName] = new Port(node, outputName, index);
	});

	return ports;
};
