import enUS from './en-US.json' assert { type: 'json' }
import ptBR from './pt-BR.json' assert { type: 'json' }

export const locales = {
	// TODO: gather available locales automatically
	'en-US': enUS,
	'pt-BR': ptBR,
}

export const getLocalizedText = (textName, locale) => locales[locale]?.[textName] ?? locales[`en-US`]?.[textName]

export const getFormattedLocalizedText = (textName, locale, ...params) => {
	let text = locales[locale]?.[textName] ?? locales[`en-US`]?.[textName]

	for (let i = 0; i < params.length; i++) {
		const param = params[i]
		text = text.replaceAll(`{${i}}`, param)
	}

	return text
}
