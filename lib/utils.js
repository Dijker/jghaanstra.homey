const Homey = require('homey');
const { HomeyAPI  } = require('athom-api');
const fetch = require('node-fetch');
const delay = time => new Promise(res=>setTimeout(res,time));

exports.sendCommand = function (path, type = 'GET', payload = '') {
  return new Promise(function (resolve, reject) {
    if (type == 'GET') {
      var options = {
        method: type
      }
    } else if (type == 'POST') {
      var options = {
        method: type,
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    }
    fetch(path, options)
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        return resolve(json);
      })
      .catch(error => {
        return reject(error);
      });
  })
}

exports.getData = function (devices) {
  return new Promise(async function (resolve, reject) {
    try {
      const api = await getApi();
      const data = [];

      devices.forEach(async function(device) {
        let device_data = await api.devices.getDevice({id: device});
        let values = []

        for (var key in device_data.capabilitiesObj) {
          values.push({
            [key]: device_data.capabilitiesObj[key].value
          });
        }

        data.push({
          type: device_data.class,
          name: device_data.name,
          capabilities: device_data.capabilities,
          values: values
        });
      });
      await delay(2000);

      resolve(data);
    } catch(error) {
      return reject(error);
    }
  })
}

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.status);
  }
}

function getApi() {
  if (!this.api) {
    this.api = HomeyAPI.forCurrentHomey();
  }
  return this.api;
}
