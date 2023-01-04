import novelTags from '../../../artificial intelligence/noveltags.json' assert { type: 'json' }

export default async interaction => {
	const focusedOption = interaction.options.getFocused(true)
	const tags = focusedOption.value.split(`,`).map(tag => tag.trim())
	const lastTag = tags.pop() ?? ``
	const sanitizedLastTag = lastTag.replace(/ /g, `_`)

	const suggestions = Object.keys(novelTags)
		.filter(tag => tag.includes(sanitizedLastTag)) // filter matches
		.sort((a, b) => novelTags[b] - novelTags[a]) // order by count
		.slice(0, 25) // only top 25 items
		.map(suggestion => // sanitize suggestions
			suggestion
				.replace(/_/g, ` `)
				.replace(/\(/g, `\\(`)
				.replace(/\)/g, `\\)`)
		)

	const APPEND_PREVIOUS_TAGS = true
	const choices = suggestions.map(suggestion => {
		const replacement = [...tags, suggestion].join(`, `)
		const finalSuggestion = 
			APPEND_PREVIOUS_TAGS ? replacement : suggestion
		return { name: finalSuggestion, value: finalSuggestion }
	})
	.filter(suggestion => suggestion.name.length <= 100) // max field length

	await interaction.respond(choices)
}

const old = async interaction => {
	const focusedOption = interaction.options.getFocused(true)
	const tags = focusedOption.value.split(`,`).map(tag => tag.trim())
	const lastTag = tags.pop() ?? ``
	const sanitizedLastTag = lastTag.replace(/ /g, `_`)
	const params = new URLSearchParams({
		"search[name_matches]": `*${sanitizedLastTag}*`,
		"search[post_count_gt]": 50,
		"search[order]": `count`,
		"limit": 25,
		"search[hide_empty]": true,
		"search[category]": [0, 3, 4],
	})
	const response = await fetch(`https://danbooru.donmai.us/tags.json?${params}`)
	const rawSuggestions = await response.json()
	const sanitizedSuggestions = rawSuggestions.map(suggestion => 
		suggestion.name
			.replace(/_/g, ` `)
			.replace(/\(/g, `\\(`)
			.replace(/\)/g, `\\)`)
	)
	const APPEND_PREVIOUS_TAGS = true
	const choices = sanitizedSuggestions.map(suggestion => {
		const replacement = [...tags, suggestion].join(`, `)
		const finalSuggestion = 
			APPEND_PREVIOUS_TAGS ? replacement : suggestion
		return { name: finalSuggestion, value: finalSuggestion }
	}).filter(suggestion => suggestion.name.length <= 100)

	await interaction.respond(choices)
}
