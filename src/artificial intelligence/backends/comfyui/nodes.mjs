import { createNodeFactory } from './workflows/core/factory.mjs';
import definitions from './definitions.json' with { type: 'json' };

const Nodes = {};

Object.entries(definitions).forEach(([name, def]) => {
	Nodes[name] = createNodeFactory(name, def);
});

export default Nodes;