'use strict';

const fetch = require('node-fetch');
const unifi = require('node-unifi');
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

  getPoEPort(deviceid, devicemac, port) {
    return new Promise((resolve, reject) => {
      var controller = new unifi.Controller(this.homey.settings.get('unifi_ip'), this.homey.settings.get('unifi_port'));

      controller.login(this.homey.settings.get('unifi_username'), this.homey.settings.get('unifi_password'), function(error) {
        if (error) {
          console.log('ERROR: ' + error);
        }

        controller.getSitesStats(function(error, sites) {
          if (error) {
            console.log('ERROR: ' + error);
          }

          controller.getAccessDevices(sites[0].name, function(error, device_data) {
            if (error) {
              console.log('ERROR: ' + error);
            }
            let poe_mode = device_data[0][0].port_overrides.filter(entry => entry.port_idx === Number(port))[0].poe_mode;
            if (poe_mode == 'auto' || poe_mode == 'on') {
              // FINALIZE, LOGOUT AND FINISH
              controller.logout();
              return resolve(true);
            } else if (poe_mode == 'off') {
              // FINALIZE, LOGOUT AND FINISH
              controller.logout();
              return resolve(false);
            }

          }, devicemac);
        })
      })
    });
  }

  switchPoEPorts(deviceid, devicemac, ports, poe_mode) {
    return new Promise((resolve, reject) => {
      var controller = new unifi.Controller(this.homey.settings.get('unifi_ip'), this.homey.settings.get('unifi_port'));

      controller.login(this.homey.settings.get('unifi_username'), this.homey.settings.get('unifi_password'), function(error) {
        if (error) {
          console.log('ERROR: ' + error);
          return reject(false);
        }

        controller.getSitesStats(function(error, sites) {
          if (error) {
            console.log('ERROR: ' + error);
            return reject(false);
          }

          controller.getAccessDevices(sites[0].name, function(error, device_data) {
            if (error) {
              console.log('ERROR: ' + error);
              return reject(false);
            }
            let portOverrides = device_data[0][0].port_overrides;
            let ports_array = ports.split(',');
            ports_array.forEach((port) => {
              port = port.replace(/^\s*/, "").replace(/\s*$/, "");
              portOverrides.filter(entry => entry.port_idx === Number(port)).forEach(entry => entry.poe_mode = poe_mode);
            });
            var newSettings = {'port_overrides': portOverrides};

            controller.setDeviceSettingsBase(sites[0].name, deviceid, newSettings, function(error, result) {
              if (error) {
                console.log('ERROR: ' + error);
                return reject(false);
              }

              // FINALIZE, LOGOUT AND FINISH
              controller.logout();
              return resolve(true);
            });

          }, devicemac);
        })
      })
    });
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
