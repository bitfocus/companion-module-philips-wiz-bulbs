import { combineRgb, splitRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { WIZ_SCENES } from './wiz/index.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const WIZ_SCENE_CHOICES: Array<{ id: number; label: string }> = WIZ_SCENES.map((s) => ({
		id: s.id,
		label: `${s.group}: ${s.name}`,
	}))

	self.setFeedbackDefinitions({
		State: {
			name: 'Bulb On/Off State',
			description: 'Indicates whether the bulb is currently on or off',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				if (self.pilot?.result?.state) {
					return true
				} else {
					return false
				}
			},
		},
		Scene: {
			name: 'Current Scene',
			description: 'Indicates whether the bulb is currently set to a specific scene',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'sceneId',
					choices: WIZ_SCENE_CHOICES,
					default: WIZ_SCENE_CHOICES[0].id,
				},
			],
			callback: (feedback) => {
				const sceneId = feedback.options.sceneId as number
				if (self.pilot?.result?.sceneId === sceneId) {
					return true
				} else {
					return false
				}
			},
		},
		Brightness: {
			name: 'Current Brightness',
			description: 'Indicates whether the bulb is currently at a specific brightness',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 255),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'number',
					label: 'Brightness (10-100)',
					id: 'brightness',
					default: 100,
					min: 10,
					max: 100,
				},
			],
			callback: (feedback) => {
				const brightness = feedback.options.brightness as number
				if (self.pilot?.result?.dimming !== undefined) {
					return self.pilot.result.dimming === brightness
				} else {
					return false
				}
			},
		},
		Temp: {
			name: 'Current Color Temperature',
			description: 'Indicates whether the bulb is currently at a specific color temperature',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'number',
					label: 'Color Temperature (2200-6500)',
					id: 'temp',
					default: 5600,
					min: 2200,
					max: 6500,
				},
			],
			callback: (feedback) => {
				const temp = feedback.options.temp as number
				if (self.pilot?.result?.temp !== undefined) {
					return self.pilot.result.temp === temp
				} else {
					return false
				}
			},
		},
		Color: {
			name: 'Current Color',
			description: 'Indicates whether the bulb is currently set to a specific RGB color',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'colorpicker',
					label: 'Color to Check',
					id: 'color',
					returnType: 'number',
					default: combineRgb(255, 255, 255),
				},
			],
			callback: (feedback) => {
				const colorRgb = feedback.options.color as number
				const colorSplit = splitRgb(colorRgb)
				if (
					self.pilot?.result?.r !== undefined &&
					self.pilot?.result?.g !== undefined &&
					self.pilot?.result?.b !== undefined
				) {
					return (
						self.pilot.result.r === colorSplit.r &&
						self.pilot.result.g === colorSplit.g &&
						self.pilot.result.b === colorSplit.b
					)
				} else {
					return false
				}
			},
		},
	})
}
