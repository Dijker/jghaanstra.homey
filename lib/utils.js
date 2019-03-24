const Homey = require('homey');
const fetch = require('node-fetch');

exports.sendCommand = function (path) {
  return new Promise(function (resolve, reject) {
    fetch(path, {
        method: 'GET'
      })
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

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.status);
  }
}
