import { Port } from "./elements.mjs";

export const resolveEffectiveSource = (source) => {
	const isPort = source instanceof Port;
	if (!isPort) return source;

	if (!source.node.muted) return source;

	const bypassKey = source.node.bypassKey;

	if (!bypassKey || !source.node.props[bypassKey]) {
		return undefined;
	}

	const fallback = source.node.props[bypassKey];
	return resolveEffectiveSource(fallback);
};
