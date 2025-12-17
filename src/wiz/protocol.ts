export const WIZ_PORT = 38899

export const WIZ_SCENES = [
	// White
	{ id: 11, name: 'Warm White', group: 'White' },
	{ id: 12, name: 'Daylight', group: 'White' },
	{ id: 13, name: 'Cool white', group: 'White' },
	// Functional
	{ id: 6, name: 'Cozy', group: 'Functional' },
	{ id: 14, name: 'Night light', group: 'Functional' },
	{ id: 15, name: 'Focus', group: 'Functional' },
	{ id: 16, name: 'Relax', group: 'Functional' },
	{ id: 17, name: 'True colors', group: 'Functional' },
	{ id: 18, name: 'TV time', group: 'Functional' },
	{ id: 19, name: 'Plant Growth', group: 'Functional' },

	// Dynamic
	{ id: 1, name: 'Ocean', group: 'Dynamic' },
	{ id: 2, name: 'Romance', group: 'Dynamic' },
	{ id: 3, name: 'Sunset', group: 'Dynamic' },
	{ id: 4, name: 'Party', group: 'Dynamic' },
	{ id: 5, name: 'Fireplace', group: 'Dynamic' },
	{ id: 7, name: 'Forest', group: 'Dynamic' },
	{ id: 8, name: 'Pastel Colors', group: 'Dynamic' },
	{ id: 20, name: 'Spring', group: 'Dynamic' },
	{ id: 21, name: 'Summer', group: 'Dynamic' },
	{ id: 22, name: 'Fall', group: 'Dynamic' },
	{ id: 23, name: 'Deepdive', group: 'Dynamic' },
	{ id: 24, name: 'Jungle', group: 'Dynamic' },
	{ id: 25, name: 'Mojito', group: 'Dynamic' },
	{ id: 26, name: 'Club', group: 'Dynamic' },
	{ id: 27, name: 'Christmas', group: 'Dynamic' },
	{ id: 28, name: 'Halloween', group: 'Dynamic' },
	{ id: 29, name: 'Candlelight', group: 'Dynamic' },
	{ id: 30, name: 'Golden white', group: 'Dynamic' },
	{ id: 31, name: 'Pulse', group: 'Dynamic' },
	{ id: 32, name: 'Steampunk', group: 'Dynamic' },

	// Progressive
	{ id: 9, name: 'Wake up', group: 'Progressive' },
	{ id: 10, name: 'Bedtime', group: 'Progressive' },

	// Misc
	{ id: 1000, name: 'Rhythm', group: 'Misc' },
]

export type WizSceneId = (typeof WIZ_SCENES)[number]['id']

type WizPGetilotResult = {
	state?: boolean
	dimming?: number
	sceneId?: number
	r?: number
	g?: number
	b?: number
	c?: number
	w?: number
	temp?: number
	speed?: number
}

export type WizGetPilotResponse = {
	method?: string
	env?: string
	result?: WizPGetilotResult
}

export type SetBulbParameters = {
	state?: boolean
	dimming?: number
	r?: number
	g?: number
	b?: number
	c?: number
	w?: number
	temp?: number
	sceneId?: number
	speed?: number
}

export type WizRequest =
	| { method: 'getPilot'; params: Record<string, never> }
	| { method: 'setPilot'; params: SetBulbParameters }

export type WizMessage = { id: number } & WizRequest
