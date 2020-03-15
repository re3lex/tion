'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var qs = _interopDefault(require('querystring'));

// const fs = require('fs');


class TionAPI {
  constructor(cfg) {
    this.email = cfg.email;
    this.password = cfg.password;
    this.authorization = cfg.authKey;
    this.minUpdateInterval = cfg.minUpdateIntervalSec || 10;
    this.lastUpdate = 0;
  }

  doAuthorization() {
    if (this.authorization) {
      return Promise.resolve(this.authorization);
    }
    const requestData = {
      username: this.email,
      password: this.password,
      client_id: 'cd594955-f5ba-4c20-9583-5990bb29f4ef',
      client_secret: 'syRxSrT77P',
      grant_type: 'password',
    };
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    return axios.post('https://api2.magicair.tion.ru/idsrv/oauth2/token', qs.stringify(requestData), config)
      .then((resp) => {
        const { status, data } = resp;
        if (status === 200) {
          const { token_type: tt, access_token: at } = data;
          this.authorization = `${tt} ${at}`;
          return this.authorization;
        }
        console.error('Error on getting token', resp);
        return Promise.reject(new Error('Error on getting token'));
      })
      .catch((e) => {
        console.error('Error on getting token', e);
        throw e;
      });
  }

  getHeaders() {
    return {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'ru-RU',
      Authorization: this.authorization,
      Connection: 'Keep-Alive',
      'Content-Type': 'application/json',
      Host: 'api2.magicair.tion.ru',
      Origin: 'https://magicair.tion.ru',
      Referer: 'https://magicair.tion.ru/dashboard/overview',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
    };
  }

  getData(force) {
    const { minUpdateInterval, lastUpdate } = this;
    if (!force && (new Date().valueOf() - lastUpdate < minUpdateInterval)) {
      return Promise.resolve(this.data);
    }

    if (!this.authorization) {
      return this.doAuthorization()
        .then((success) => {
          if (success) {
            return this.getData();
          }
          console.error('Authorization failed!');
          return Promise.reject(new Error('Authorization failed!'));
        });
    }
    this.data = undefined;
    return axios.get('https://api2.magicair.tion.ru/location', { headers: this.getHeaders() })
      .then((resp) => {
        const { status, data } = resp;
        if (status === 200) {
          [this.data] = data; // new Tion();
          this.lastUpdate = new Date().valueOf();
          return Promise.resolve(this.data);
        }
        if (status === 401) {
          console.warn('Authorization is required');
          this.authorization = undefined;
          return this.doAuthorization()
            .then((success) => {
              if (success) {
                return this.getData();
              }
              console.error('Authorization failed!');
              return Promise.reject(new Error('Authorization failed!'));
            });
        }
        const error = `Status code while getting data is ${status}, content:\n ${JSON.stringify(data)}!`;
        console.error(error);
        return Promise.reject(new Error(`Status code while getting data is ${status}`));
      });
  }

  getZones({ names = [], guids = [] }) {
    return this.getData()
      .then((data) => {
        const { zones = [] } = data;
        return zones.filter((z) => guids.indexOf(z.guid) >= 0
          || names.indexOf(z.name) >= 0);
      });
  }

  getDevices({ names = [], guids = [], types = [] }) {
    return this.getData()
      .then((data) => {
        const { zones = [] } = data;
        const devices = [];
        zones.forEach((z) => {
          const found = z.devices.filter((d) => guids.indexOf(d.guid) >= 0
            || names.indexOf(d.name) >= 0
            || types.indexOf(d.type) >= 0);
          devices.push(...found);
        });
        return devices;
      });
  }
}

module.exports = TionAPI;
