import { getRandomItem } from '../utils/math.js'
import enUS from './en-US.json' assert { type: 'json' }
import ptBR from './pt-BR.json' assert { type: 'json' }

export const locales = {
	// TODO: gather available locales automatically
	'en-US': enUS,
	'pt-BR': ptBR,
}

export const getLocalizedText = (textName, locale, ...params) => {
	let text = locales[locale]?.[textName] ?? locales[`en-US`]?.[textName]

	if (Array.isArray(text))
		text = getRandomItem(text)

	if (!params)
		return text

	for (const [index, param] of params.entries())
		text = text.replaceAll(`{${index}}`, param)

	return text
}
