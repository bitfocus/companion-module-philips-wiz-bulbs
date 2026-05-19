import type { ModuleInstance } from './main.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'state', name: 'Bulb state (on/off)' },
		{ variableId: 'brightness', name: 'Brightness (10-100)' },
		{ variableId: 'sceneId', name: 'Scene ID' },
		{ variableId: 'temp', name: 'Color temperature' },
		{ variableId: 'r', name: 'Red value' },
		{ variableId: 'g', name: 'Green value' },
		{ variableId: 'b', name: 'Blue value' },
		{ variableId: 'speed', name: 'Effect speed' },
	])
}

export function UpdateVariableValues(self: ModuleInstance): void {
	const result = self.pilot?.result

	self.setVariableValues({
		state: result?.state === undefined ? '' : result.state ? 'on' : 'off',
		brightness: result?.dimming ?? '',
		sceneId: result?.sceneId ?? '',
		temp: result?.temp ?? '',
		r: result?.r ?? '',
		g: result?.g ?? '',
		b: result?.b ?? '',
		speed: result?.speed ?? '',
	})
}

export function ResetVariableValuesToDefault(self: ModuleInstance): void {
	self.setVariableValues({
		state: '',
		brightness: '',
		sceneId: '',
		temp: '',
		r: '',
		g: '',
		b: '',
		speed: '',
	})
}
