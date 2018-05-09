const Homey = require('homey');

module.exports = [
	{
		description: 'Say text from POST request',
		method   : 'POST',
		path     : '/:source',
		public   : false,
		fn: function(args, callback) {
    	Homey.ManagerSpeechOutput.say(args.body.message);
      callback(null, 'OK');
		}
	}
]
