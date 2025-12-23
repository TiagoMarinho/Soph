import crypto from "node:crypto";

export const createId = () => crypto.randomUUID().split("-")[0];

export class Node {
	constructor(type, props, bypassKey) {
		this.id = createId();
		this.type = type;
		this.props = props;
		this.bypassKey = bypassKey;
		this.muted = false;

		Object.seal(this);
	}

	mute() {
		this.muted = true;
	}
}

export class Port {
	constructor(node, name, index) {
		this.node = node;
		this.name = name;
		this.index = index;
		Object.freeze(this);
	}
}
