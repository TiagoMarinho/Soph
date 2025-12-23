import createComfyUIGraph from "./backends/comfyui/workflows/comfyui-graph.mjs"
import { getImages } from "./backends/comfyui/comfyui-fetch-image.mjs"

export class GenerationJob {
	constructor(params) {
		this.params = params
		this.buffers = new Array(params.batchCount).fill(null)
		this.startTime = 0
		
		this.stepsPerBase = params.steps
		this.stepsPerTotal = params.steps + params.upscaling_steps
	}

	calculateStats(currentIndex, isFinalForIndex) {
		const timeTaken = performance.now() - this.startTime
		const completedImagesSteps = currentIndex * this.stepsPerTotal
		const currentImageSteps = isFinalForIndex ? this.stepsPerTotal : this.stepsPerBase
		const totalSteps = completedImagesSteps + currentImageSteps

		return {
			seconds: Math.floor(timeTaken / 100) / 10,
			speed: Math.floor(totalSteps / (timeTaken / 1000) * 10) / 10,
			finishedIndex: currentIndex,
			isComplete: currentIndex === this.params.batchCount - 1 && isFinalForIndex
		}
	}

	async run(onUpdate) {
		this.startTime = performance.now()

		for (let i = 0; i < this.params.batchCount; i++) {
			const currentSeed = this.params.seed + i
			const graphParams = { ...this.params, batch: 1, seed: currentSeed }
			const graph = createComfyUIGraph(graphParams)

			const notify = (buffer, isFinal) => {
				this.buffers[i] = buffer
				const stats = this.calculateStats(i, isFinal)
				onUpdate(buffer, stats, this.params.seed, isFinal)
			}

			const allImages = await getImages(graph, (previewBuffers, metas) => {
				const isPreview = metas.some(m => m.filename.startsWith("Soph_Preview"))
				if (isPreview) notify(previewBuffers[0], false)
			})

			const finalImage = allImages.find(img => !img.meta.filename.startsWith("Soph_Preview"))
			if (finalImage) notify(finalImage.buffer, true)
		}
	}
}