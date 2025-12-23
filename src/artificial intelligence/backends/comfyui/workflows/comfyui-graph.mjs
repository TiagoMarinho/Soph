import { getRandomInt } from "../../../../utils/math.mjs";
import Nodes from "../nodes.mjs";
import { serialize } from "../serializer.mjs";

const createComfyUIGraph = (params) => {
	// 1. Common Resources
	const ckpt = Nodes.CheckpointLoaderSimple({
		ckpt_name: params.model,
	});

	const positive = Nodes.CLIPTextEncode({
		text: params.prompt,
		clip: ckpt.clip,
	});

	const negative = Nodes.CLIPTextEncode({
		text: params.negative_prompt,
		clip: ckpt.clip,
	});

	// 2. Flux Logic
	const isFlux = params.model.startsWith("flux");

	const effectivePositive = isFlux
		? Nodes.FluxGuidance({
				conditioning: positive.conditioning,
				guidance: params.cfg,
		  }).conditioning
		: positive.conditioning;

	const samplerCfg = isFlux ? 1.0 : params.cfg;

	// 3. Base Generation
	const emptyLatent = Nodes.EmptySD3LatentImage({
		width: params.width,
		height: params.height,
		batch_size: params.batch,
	});

	const baseSampler = Nodes.KSampler({
		seed: params.seed,
		steps: params.steps,
		cfg: samplerCfg,
		sampler_name: params.sampler,
		scheduler: params.scheduler,
		denoise: 1.0,
		model: ckpt.model,
		positive: effectivePositive,
		negative: negative.conditioning,
		latent_image: emptyLatent.latent,
	});

	// 4. Upscaling Branch
	const upscaleBranch = (() => {
		if (params.latent_upscale <= 1.0) {
			return { result: baseSampler.latent, previews: [] };
		}

		const pDecode = Nodes.VAEDecode({
			samples: baseSampler.latent,
			vae: ckpt.vae,
		});

		const pSave = Nodes.SaveImage({
			filename_prefix: "Soph_Preview",
			images: pDecode.image,
		});

		const upLatent = Nodes.LatentUpscaleBy({
			upscale_method: "bislerp",
			scale_by: params.latent_upscale,
			samples: baseSampler.latent,
		});

		const upSampler = Nodes.KSampler({
			seed: getRandomInt(0, 99999999),
			steps: Math.min(params.steps, 16),
			cfg: params.cfg,
			sampler_name: params.sampler,
			scheduler: params.scheduler,
			denoise: params.denoise,
			model: ckpt.model,
			positive: effectivePositive,
			negative: negative.conditioning,
			latent_image: upLatent.latent,
		});

		return { result: upSampler.latent, previews: [pSave] };
	})();

	// 5. Decode
	const decodedImage = Nodes.VAEDecode({
		samples: upscaleBranch.result,
		vae: ckpt.vae,
	});

	// 6. Face Detailer
	const detailerBranch = (() => {
		if (!params.face_detailer) {
			return { result: decodedImage.image, previews: [] };
		}

		const pSave = Nodes.SaveImage({
			filename_prefix: "Soph_Preview",
			images: decodedImage.image,
		});

		const bbox = Nodes.UltralyticsDetectorProvider({
			model_name: "bbox/face_yolov8m.pt",
		});

		const sam = Nodes.SAMLoader({
			model_name: "sam_vit_b_01ec64.pth",
			device_mode: "AUTO",
		});

		const detailed = Nodes.FaceDetailer({
			image: decodedImage.image,
			model: ckpt.model,
			clip: ckpt.clip,
			vae: ckpt.vae,
			positive: effectivePositive,
			negative: negative.conditioning,
			bbox_detector: bbox.BBOX_DETECTOR,
			sam_model_opt: sam.SAM_MODEL,

			// Core Settings
			guide_size: 512,
			guide_size_for: true,
			max_size: 1536,
			seed: params.seed,
			steps: params.steps,
			cfg: params.cfg,
			sampler_name: params.sampler,
			scheduler: params.scheduler,
			denoise: 0.5,

			// BBox Settings
			cycle: 1,
			bbox_threshold: 0.5,
			bbox_dilation: 10,
			bbox_crop_factor: 3.0,

			// SAM Settings
			sam_detection_hint: "center-1",
			sam_dilation: 0,
			sam_threshold: 0.93,
			sam_bbox_expansion: 0,
			sam_mask_hint_threshold: 0.7,
			sam_mask_hint_use_negative: "False",

			// Inpaint Settings
			drop_size: 10,
			wildcard: "",
			feather: 5,
			noise_mask: true,
			force_inpaint: false,
		});

		return { result: detailed.image, previews: [pSave] };
	})();

	const finalSave = Nodes.SaveImage({
		filename_prefix: "Soph",
		images: detailerBranch.result,
	});

	return serialize([
		finalSave,
		...upscaleBranch.previews,
		...detailerBranch.previews,
	]);
};

export default createComfyUIGraph;
