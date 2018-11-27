"use strict";

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class DuwiDevice extends ZwaveDevice {

	async onMeshInit() {
		this.registerCapability('onoff', 'SWITCH_BINARY');
	}

}

module.exports = DuwiDevice;
