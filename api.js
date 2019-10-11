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
	},
  {
		description: 'Return data from devices',
		method   : 'POST',
		path     : '/owneyapi',
		public   : true,
		fn: async function(args, callback) {
      try {
        const data = await util.getData(args.body.devices.split(", "));
        return callback(null, data);
      } catch (error) {
        return callback(error, false);
      }
		}
	}
]
