const Homey = require('homey');

module.exports = [
	{
		description: 'Say text from POST request',
		method   : 'POST',
		path     : '/:source',
		public   : true,
		fn: function(args, callback) {
    	Homey.ManagerSpeechOutput.say(args.body.message);
      return callback(null, 'OK');
		}
	}
]
