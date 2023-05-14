import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js"
import { optionalOptions, requiredOptions } from "../../../shared/base-options.js"

export default {
    name: "controlnet",
	description: "Generate images using controlnet",
	description_localizations: {
		"pt-BR": "Gerar imagens usando controlnet"
	},
    type: ApplicationCommandType.ChatInput,
    options: [
        ...requiredOptions,
        {
            type: ApplicationCommandOptionType.Attachment,
            name: "controlnet-image",
            description: "Image to use as input",
            name_localizations: {
                "pt-BR": "imagem"
            },
            description_localizations: {
                "pt-BR": "Usar uma imagem para guiar o resultado"
            },
            required: true
        },
        {
            type: 3,
            name: "controlnet-model",
            description: "Model to use on control net",
            name_localizations: {
                "pt-BR": "modelo"
            },
            description_localizations: {
                "pt-BR": "Modelo para ser usado no control net"
            },
            required: true,
            choices: [
                { name: "Depth", value: "control_v11f1p_sd15_depth [cfd03158]" },
                { name: "Canny", value: "control_v11p_sd15_canny [d14c016b]" },
                { name: "Lineart", value: "control_v11p_sd15_lineart [43d4be0d]" },
                { name: "Openpose", value: "control_v11p_sd15_openpose [cab727d4]" },
                { name: "Lineart Anime", value: "control_v11p_sd15s2_lineart_anime [3825e83e]" }
            ]
        },
        ...optionalOptions,
		{
            type: 3,
            name: "controlnet-module",
            description: "Module to use on control net",
            name_localizations: {
                "pt-BR": "modulo"
            },
            description_localizations: {
                "pt-BR": "Módulo para ser usado no control net"
            },
            required: false,
            choices: [
                { name: "Depth", value: "depth" },
                { name: "Depth Leres", value: "depth_leres" },
                { name: "Depth Leres++", value: "depth_leres++" },
                { name: "Depth Zoe", value: "depth_zoe" },
                { name: "Canny", value: "canny" },
                { name: "Lineart", value: "lineart" },
                { name: "Lineart Coarse", value: "lineart_coarse" },
                { name: "Lineart Anime", value: "lineart_anime" },
                { name: "Lineart Standard", value: "lineart_standard" },
                { name: "Lineart Anime Denoise", value: "lineart_anime_denoise" },
                { name: "Openpose", value: "openpose" },
                { name: "Openpose Hand", value: "openpose_hand" },
                { name: "Openpose Face", value: "openpose_face" },
                { name: "Openpose Face Only", value: "openpose_faceonly" },
                { name: "Openpose Full", value: "openpose_full" }
            ]
        },
        {
            type: 10,
            name: "controlnet-weight",
            description: "How much weight for the control net",
            name_localizations: {
                "pt-BR": "peso"
            },
            description_localizations: {
                "pt-BR": "Quanto de peso para o control net"
            },
            required: false,
            min_value: 0,
            max_value: 2
        },
        {
            type: 10,
            name: "controlnet-guidance-start",
            description: "Ratio of generation where control net starts to have an effect",
            description_localizations: {
                "pt-BR": "Proporção na qual control net começa a ter efeito"
            },
            required: false,
            min_value: 0,
            max_value: 1
        },
        {
            type: 10,
            name: "controlnet-guidance-end",
            description: "Ratio of generation where control net stops to have an effect",
            description_localizations: {
                "pt-BR": "Proporção na qual control net para de ter efeito"
            },
            required: false,
            min_value: 0,
            max_value: 1
        },
        {
            type: 10,
            name: "controlnet-mode",
            description: "Modifies what control net gives priority when generating a image",
            name_localizations: {
                "pt-BR": "modo"
            },
            description_localizations: {
                "pt-BR": "Muda oque control net dá prioridade durante a geração"
            },
            required: false,
            choices: [
                { name: "Balanced", value: 0 },
                { name: "Prompt is more important", value: 1 },
                { name: "ControlNet is more important", value: 2 }
            ],
            choices_localizations: {
                "pt-BR": [
                    { name: "Balanceado", value: 0 },
                    { name: "A prompt é mais importante", value: 1 },
                    { name: "O ControlNet é mais importante", value: 2 }
                ]
            }
        }
    ]
}