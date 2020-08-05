'use strict';

const Util = require('/lib/util.js');

module.exports = {
  async sayTextRequest({homey, body}) {
    const util = new Util({homey: homey});

    const result = await homey.speechOutput.say(body.message);
    return result;
  }
}
