import config from "../../../../config.json" with { type: "json" };

const SERVER = config.comfyuiServer || 'http://127.0.0.1:8188';

/**
 * Queues a node graph prompt (set to produce 4 outputs), waits for completion,
 * and returns an array of 4 Buffers—one per generated image.
 *
 * @param {Object} graph - ComfyUI node graph JSON (with batch_size=4).
 * @returns {Promise<Buffer[]>} - Resolves to an array of 4 image Buffers.
 */
export const getImages = async graph => {
	// 1. Generate a cryptographically random clientId for this request
	const clientId = randomBytes(16).toString('hex');

	// 2. Queue the prompt (include client_id so WebSocket notifications match)
	// Use `new Url` to avoid any problem with the address ending with a slash or not.
	const queueRes = await fetch(new URL('/prompt', SERVER).toString(), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prompt: graph, client_id: clientId })
	});
	if (!queueRes.ok) {
		throw new Error(`Failed to queue prompt: ${queueRes.statusText}`);
	}
	const { prompt_id: promptId } = await queueRes.json();

	// 3. Open a WebSocket with the same clientId, wait for "node === null"
	await new Promise((resolve, reject) => {
		// Convert http:// (or https) to ws:// to use as websocket server.
		const wsUrl = SERVER.replace(/^https?/, 'ws');
		const ws = new WebSocket(new URL('/ws', wsUrl).toString() + `?clientId=${clientId}`);

		ws.on('message', msg => {
			let parsed;
			try {
				parsed = JSON.parse(msg);
			} catch {
				return; // ignore anything that's not JSON
			}
			const { type, data } = parsed;
			// ComfyUI sends {type: "executing", data: { prompt_id, node }}
			// When data.node === null, that prompt is fully done.
			if (type === 'executing' && data.prompt_id === promptId && data.node === null) {
				ws.close();
				resolve();
			}
		});

		ws.on('error', err => {
			reject(new Error(`WebSocket error: ${err.message}`));
		});
	});

	// 4. Fetch history, collect all image metadata for that prompt
	const historyRes = await fetch(`${SERVER}/history/${promptId}`);
	if (!historyRes.ok) {
		throw new Error(`Failed to fetch history: ${historyRes.statusText}`);
	}
	const history = await historyRes.json();
	const outputs = history[promptId]?.outputs || {};

	// Gather every image meta (should be 4 items if your graph outputs 4)
	const allImageMetas = [];
	for (const node of Object.values(outputs)) {
		if (node.images && node.images.length > 0) {
			node.images.forEach(meta => allImageMetas.push(meta));
		}
	}

	if (allImageMetas.length === 0) {
		throw new Error('No images found in prompt outputs');
	}

	// 5. Download each image and return as Buffer[]
	const buffers = await Promise.all(
		allImageMetas.map(async ({ filename, subfolder, type }) => {
			const url = `${SERVER}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
			const imgRes = await fetch(url);
			if (!imgRes.ok) {
				throw new Error(`Failed to download ${filename}: ${imgRes.statusText}`);
			}
			const arrayBuffer = await imgRes.arrayBuffer();
			return Buffer.from(arrayBuffer);
		})
	);

	return buffers;
};
