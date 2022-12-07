import enUS from './en-US.json' assert { type: 'json' }
import ptBR from './pt-BR.json' assert { type: 'json' }

export const locales = { // TODO: gather available locales automatically
	"en-US": enUS,
	"pt-BR": ptBR
}

export const getLocalizedText = (textName, locale) => 
	locales[locale]?.[textName] ?? locales[`en-US`]?.[textName]