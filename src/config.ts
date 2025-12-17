import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	pollMs: number
	enablePolling: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: Regex.IP,
			required: true,
		},
		{
			type: 'number',
			id: 'pollMs',
			label: 'Poll Interval (ms)',
			width: 3,
			min: 1000,
			max: 60000,
			default: 5000,
			required: true,
		},
		{
			type: 'checkbox',
			id: 'enablePolling',
			label: 'Enable Polling',
			default: true,
			width: 2,
		},
	]
}
