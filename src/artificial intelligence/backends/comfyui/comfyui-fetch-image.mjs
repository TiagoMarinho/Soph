import { WebSocket } from "ws";
import { randomUUID } from "crypto";
import config from "../../../../config.json" with { type: "json" };

const BASE_URL = new URL(config.comfyuiServer || "http://127.0.0.1:8188");
const WS_URL = new URL("/ws", BASE_URL);
WS_URL.protocol = WS_URL.protocol.replace("http", "ws");

const HEADERS = { "Content-Type": "application/json" };

const safeJsonParse = (str) => {
	try {
		return JSON.parse(str);
	} catch {
		return null;
	}
};

const createApiUrl = (path, params = {}) => {
	const url = new URL(path, BASE_URL);
	Object.entries(params).forEach(([key, value]) =>
		url.searchParams.append(key, value)
	);
	return url;
};

const fetchJson = async (path, options = {}) => {
	const response = await fetch(createApiUrl(path), options);
	if (!response.ok)
		throw new Error(`API Request Failed: ${path} (${response.statusText})`);
	return response.json();
};

const downloadBuffer = async (metadata) => {
	const { filename, subfolder, type } = metadata;
	const url = createApiUrl("/view", { filename, subfolder, type });
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Image Download Failed: ${filename}`);
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
};

const extractImageMetadata = (history, promptId) => {
	const promptHistory = history[promptId];
	if (!promptHistory?.outputs) return [];

	return Object.values(promptHistory.outputs).flatMap(
		(node) => node.images || []
	);
};

const handleIntermediateResult = async (data, callback) => {
	const images = data?.output?.images;
	if (!images?.length) return;

	const promises = images.map(downloadBuffer);
	const buffers = await Promise.all(promises);

	callback(buffers, images);
};

const monitorExecution = (clientId, promptId, onIntermediate) => {
	return new Promise((resolve, reject) => {
		const socket = new WebSocket(`${WS_URL}?clientId=${clientId}`);

		const close = () => {
			socket.removeAllListeners();
			socket.close();
		};

		socket.on("error", (err) => {
			close();
			reject(err);
		});

		socket.on("message", (raw) => {
			const message = safeJsonParse(raw);
			if (!message) return;

			const { type, data } = message;

			const isExecuted =
				type === "executed" && data.prompt_id === promptId;
			if (isExecuted && onIntermediate) {
				handleIntermediateResult(data, onIntermediate).catch(
					console.error
				);
			}

			const isExecutionComplete =
				type === "executing" &&
				data.prompt_id === promptId &&
				data.node === null;

			if (isExecutionComplete) {
				close();
				resolve();
			}
		});
	});
};

const queuePrompt = async (graph, clientId) => {
	const payload = { prompt: graph, client_id: clientId };
	const response = await fetchJson("/prompt", {
		method: "POST",
		headers: HEADERS,
		body: JSON.stringify(payload),
	});
	return response.prompt_id;
};

const getHistory = async (promptId) => {
	return fetchJson(`/history/${promptId}`);
};

export const getImages = async (graph, onIntermediateImage) => {
	const clientId = randomUUID();

	const promptId = await queuePrompt(graph, clientId);

	await monitorExecution(clientId, promptId, onIntermediateImage);

	const history = await getHistory(promptId);
	const metadata = extractImageMetadata(history, promptId);

	if (metadata.length === 0)
		throw new Error("No output images found in prompt history");

	// Return both buffer and metadata so the caller can filter results
	return Promise.all(
		metadata.map(async (meta) => ({
			buffer: await downloadBuffer(meta),
			meta,
		}))
	);
};