const Homey = require('homey');
const util = require('/lib/utils.js');

module.exports = [
	{
		description: 'Say text from POST request',
		method   : 'POST',
		path     : '/say/:source',
		public   : true,
		fn: function(args, callback) {
    	Homey.ManagerSpeechOutput.say(args.body.message);
      return callback(null, 'OK');
		}
	}
]
