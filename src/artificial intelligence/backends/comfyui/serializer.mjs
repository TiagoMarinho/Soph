import { Node, Port } from "./workflows/core/elements.mjs";
import { resolveEffectiveSource } from "./workflows/core/resolver.mjs";

const getNodeFromItem = (item) => {
	if (item instanceof Node) return item;
	if (item instanceof Port) return item.node;
	return null;
};

export const serialize = (graphRoots) => {
	const registry = {};
	const visitedIds = new Set();

	const walk = (item) => {
		const node = getNodeFromItem(item);

		if (!node) return;
		if (visitedIds.has(node.id)) return;
		if (node.muted) return;

		visitedIds.add(node.id);

		const serializedInputs = {};

		Object.entries(node.props).forEach(([key, value]) => {
			const effectiveSource = resolveEffectiveSource(value);

			walk(effectiveSource);

			const isRef = effectiveSource instanceof Port;
			serializedInputs[key] = isRef
				? [effectiveSource.node.id, effectiveSource.index]
				: effectiveSource;
		});

		registry[node.id] = {
			inputs: serializedInputs,
			class_type: node.type,
			_meta: { title: node.type },
		};
	};

	const roots = Array.isArray(graphRoots) ? graphRoots : [graphRoots];
	roots.forEach((item) => walk(resolveEffectiveSource(item)));

	return registry;
};
