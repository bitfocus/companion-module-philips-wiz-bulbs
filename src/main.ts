import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	UDPHelper,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { WIZ_PORT, WizGetPilotResponse } from './wiz/protocol.js'
import dgram from 'dgram'
import { encode, wiz } from './wiz/index.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	udp!: UDPHelper
	private pollTimer?: NodeJS.Timeout
	pilot?: WizGetPilotResponse
	private pollInFlight = false

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.init_udp()
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.udp) {
			this.udp.destroy()
		}

		this.stopPolling()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.saveConfig(config)
		await this.init_udp()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}

	async init_udp(): Promise<void> {
		if (this.udp) {
			this.udp.destroy()
		}

		if (this.pollTimer) {
			this.stopPolling()
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.udp = new UDPHelper(this.config.host, WIZ_PORT)
			this.updateStatus(InstanceStatus.Ok)

			this.udp.on('data', (msg: Buffer, _rinfo: dgram.RemoteInfo) => {
				let data: WizGetPilotResponse
				try {
					data = JSON.parse(msg.toString('utf8'))
				} catch {
					return
				}
				if (data.method !== 'getPilot') return
				this.onPilotUpdate(data)
				this.pollInFlight = false
			})

			this.udp.on('error', (err: Error) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', 'Network error: ' + err.message)
				this.pollInFlight = false
			})

			// If we get data, thing should be good
			this.udp.on('listening', () => {
				this.updateStatus(InstanceStatus.Ok)
				this.pollInFlight = false
			})

			this.udp.on('status_change', (status: InstanceStatus, message: string | undefined) => {
				this.updateStatus(status, message)
				this.pollInFlight = false
			})

			this.startPolling()
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	startPolling(): void {
		const pollMs = Math.max(1000, this.config.pollMs || 1000)
		if (this.config.enablePolling === true) {
			this.pollTimer = setInterval(() => void this.pollOnce(), pollMs)
		} else {
			void this.pollOnce()
		}
	}

	onPilotUpdate(newPilot: WizGetPilotResponse): void {
		this.pilot = newPilot
		this.log('debug', `Received pilot update: ${JSON.stringify(newPilot)}`)

		this.checkFeedbacks('State', 'Scene', 'Brightness', 'Color', 'Temp')
		// this.checkFeedbacks('bulb_on', 'scene', 'brightness')
	}

	private stopPolling(): void {
		if (this.pollTimer) clearInterval(this.pollTimer)
		this.pollTimer = undefined
		this.pollInFlight = false
	}

	async pollOnce(): Promise<void> {
		if (!this.udp || !this.config.host) return
		if (this.pollInFlight) return

		this.pollInFlight = true
		const buf = encode(wiz.getPilot())
		await this.udp.send(buf)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
