import { combineRgb, splitRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { encode, wiz, WIZ_SCENES } from './wiz/index.js'

function clampBrightness(value: number): number {
	return Math.max(10, Math.min(100, Math.round(value)))
}

function clampTemperature(value: number): number {
	return Math.max(2200, Math.min(6500, Math.round(value)))
}

export function UpdateActions(self: ModuleInstance): void {
	const WIZ_SCENE_CHOICES: Array<{ id: number; label: string }> = WIZ_SCENES.map((s) => ({
		id: s.id,
		label: `${s.group}: ${s.name}`,
	}))

	self.setActionDefinitions({
		bulbOn: {
			name: 'Turn Bulb On',
			description: 'Turns the bulb on',
			options: [],
			callback: async () => {
				const sendBuf = encode(wiz.setState(true))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		bulbOff: {
			name: 'Turn Bulb Off',
			description: 'Turns the bulb off',
			options: [],
			callback: async () => {
				const sendBuf = encode(wiz.setState(false))
				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		setColor: {
			name: 'Set Color (Will Turn On Bulb)',
			description: 'Sets the bulb to a specific RGB color',
			options: [
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					returnType: 'number',
					default: combineRgb(255, 255, 255),
				},
				{
					type: 'number',
					label: 'Brightness (10-100) (optional)',
					id: 'brightness',
					default: 0,
					min: 10,
					max: 100,
				},
			],
			callback: async (action) => {
				const colorRgb = action.options.color as number
				const colorSplit = splitRgb(colorRgb)
				self.log('debug', `Set color action triggered with color: ${colorRgb}`)
				let sendBuf: Buffer
				if (action.options.brightness === 0) {
					sendBuf = encode(
						wiz.setRGB({
							r: colorSplit.r,
							g: colorSplit.g,
							b: colorSplit.b,
						}),
					)
				} else {
					sendBuf = encode(
						wiz.setRGB(
							{
								r: colorSplit.r,
								g: colorSplit.g,
								b: colorSplit.b,
							},
							action.options.brightness as number,
						),
					)
				}

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		setScene: {
			name: 'Set Scene (Will Turn On Bulb)',
			description: 'Sets the bulb to a predefined scene',
			options: [
				{
					type: 'dropdown',
					label: 'Scene',
					id: 'sceneId',
					choices: WIZ_SCENE_CHOICES,
					default: WIZ_SCENE_CHOICES[0].id,
				},
				{
					type: 'number',
					label: 'Brightness (10-100) (optional)',
					id: 'brightness',
					default: 0,
					min: 10,
					max: 100,
				},
			],
			callback: async (action) => {
				let sendBuf: Buffer
				if (action.options.brightness === 0) {
					sendBuf = encode(wiz.setScene(action.options.sceneId as number))
				} else {
					sendBuf = encode(wiz.setScene(action.options.sceneId as number, action.options.brightness as number))
				}

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		setTemp: {
			name: 'Set Color Temperature (Will Turn On Bulb)',
			description: 'Sets the bulb to a specific color temperature',
			options: [
				{
					type: 'number',
					label: 'Temperature (2200-6500)',
					id: 'temp',
					default: 5600,
					min: 2200,
					max: 6500,
				},
				{
					type: 'number',
					label: 'Brightness (10-100) (optional)',
					id: 'brightness',
					default: 0,
					min: 10,
					max: 100,
				},
			],
			callback: async (action) => {
				let sendBuf: Buffer
				if (action.options.brightness === 0) {
					sendBuf = encode(wiz.setTemp(action.options.temp as number))
				} else {
					sendBuf = encode(wiz.setTemp(action.options.temp as number, action.options.brightness as number))
				}

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		setbrightness: {
			name: 'Set Brightness (Will NOT Turn On Bulb)',
			description: 'Sets the bulb brightness',
			options: [
				{
					type: 'number',
					label: 'Brightness (10-100)',
					id: 'brightness',
					default: 85,
					min: 10,
					max: 100,
				},
			],
			callback: async (action) => {
				const sendBuf = encode(wiz.setBrightness(action.options.brightness as number))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		increaseBrightness: {
			name: 'Increase Brightness By Value',
			description: 'Increases current bulb brightness by a configurable value',
			options: [
				{
					type: 'number',
					label: 'Increase by',
					id: 'delta',
					default: 5,
					min: 1,
					max: 90,
				},
			],
			callback: async (action) => {
				const delta = action.options.delta as number
				const currentBrightness = self.pilot?.result?.dimming ?? 100
				const nextBrightness = clampBrightness(currentBrightness + delta)
				const sendBuf = encode(wiz.setBrightness(nextBrightness))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		decreaseBrightness: {
			name: 'Decrease Brightness By Value',
			description: 'Decreases current bulb brightness by a configurable value',
			options: [
				{
					type: 'number',
					label: 'Decrease by',
					id: 'delta',
					default: 5,
					min: 1,
					max: 90,
				},
			],
			callback: async (action) => {
				const delta = action.options.delta as number
				const currentBrightness = self.pilot?.result?.dimming ?? 100
				const nextBrightness = clampBrightness(currentBrightness - delta)
				const sendBuf = encode(wiz.setBrightness(nextBrightness))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		temperatureUp: {
			name: 'Increase Temperature By Value',
			description: 'Increases current color temperature by a configurable value',
			options: [
				{
					type: 'number',
					label: 'Increase by (Kelvin)',
					id: 'delta',
					default: 100,
					min: 50,
					max: 2000,
				},
			],
			callback: async (action) => {
				const delta = action.options.delta as number
				const currentTemp = self.pilot?.result?.temp ?? 5600
				const nextTemp = clampTemperature(currentTemp + delta)
				const sendBuf = encode(wiz.setTemp(nextTemp))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
		temperatureDown: {
			name: 'Decrease Temperature By Value',
			description: 'Decreases current color temperature by a configurable value',
			options: [
				{
					type: 'number',
					label: 'Decrease by (Kelvin)',
					id: 'delta',
					default: 100,
					min: 50,
					max: 2000,
				},
			],
			callback: async (action) => {
				const delta = action.options.delta as number
				const currentTemp = self.pilot?.result?.temp ?? 5600
				const nextTemp = clampTemperature(currentTemp - delta)
				const sendBuf = encode(wiz.setTemp(nextTemp))

				if (self.udp !== undefined) {
					self.log('debug', `sending to ${self.config.host}: ${sendBuf.toString()}`)

					await self.udp.send(sendBuf)
					await self.pollOnce()
				}
			},
		},
	})
}
