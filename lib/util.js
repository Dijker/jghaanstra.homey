'use strict';

const fetch = require('node-fetch');
const delay = time => new Promise(res=>setTimeout(res,time));

class Util {

  constructor(opts) {
    this.homey = opts.homey;
  }

  sendCommand(path, type = 'GET', payload = '', headers = "{'Content-Type': 'application/json'}") {
    return new Promise((resolve, reject) => {
      if (type == 'GET') {
        var options = {
          method: type
        }
      } else if (type == 'POST') {
        var options = {
          method: type,
          body: payload,
          headers: JSON.parse(headers)
        }
      }
      fetch(path, options)
        .then(this.checkStatus)
        .then(res => res.json())
        .then(json => {
          return resolve(json);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  checkStatus = (res) => {
    if (res.ok) {
      return res;
    } else {
      throw new Error(res.status);
    }
  }

}

module.exports = Util;
