require('dotenv').config({ path: `${__dirname}/.env` });
const fs = require('fs');
const TionAPI = require('../dist/TionAPI.cjs.js');

const { email, password } = process.env;

const authFile = 'tion_auth';

let authKey;
if (fs.existsSync(authFile)) {
  authKey = fs.readFileSync(authFile, 'utf-8');
}

const afterAuthorization = (key) => {
  fs.writeFileSync(authFile, key);
};

const api = new TionAPI({
  email, password, authKey, afterAuthorization,
});

api.getDevices({ types: ['breezer3'] })
  .then((devices) => {
    const [d] = devices;
    console.log(d.data.co2);
  })
  .catch((err) => {
    console.error(err);
  });
