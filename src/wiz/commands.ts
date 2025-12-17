import type { SetBulbParameters, WizRequest, WizMessage } from './protocol.js'

export const wiz = {
	getPilot: (): WizRequest => ({ method: 'getPilot', params: {} as Record<string, never> }),

	// Generic setPilot
	setPilot: (params: SetBulbParameters): WizRequest => ({
		method: 'setPilot',
		params,
	}),

	setState: (state: boolean): WizRequest => ({ method: 'setPilot', params: { state } }),

	setBrightness: (brightness: number): WizRequest => ({ method: 'setPilot', params: { dimming: brightness } }),

	setRGB: (rgb: { r: number; g: number; b: number }, brightness?: number): WizRequest => ({
		method: 'setPilot',
		params: { ...rgb, ...(brightness === undefined ? {} : { dimming: brightness }) },
	}),

	setTemp: (temp: number, brightness?: number): WizRequest => ({
		method: 'setPilot',
		params: { temp, ...(brightness === undefined ? {} : { dimming: brightness }) },
	}),

	setScene: (sceneId: number, brightness?: number): WizRequest => ({
		method: 'setPilot',
		params: { sceneId, ...(brightness === undefined ? {} : { dimming: brightness }) },
	}),
} as const

// Wrap request with id and encode
export function encode(req: WizRequest, id = 1): Buffer {
	const msg: WizMessage = { id, ...req }
	return Buffer.from(JSON.stringify(msg), 'latin1')
}
