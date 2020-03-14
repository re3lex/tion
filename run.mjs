import fs from 'fs';
import dotenv from 'dotenv';
import TionAPI from './src/TionAPI.js';

dotenv.config();

const { email, password } = process.env;

const authFile = 'tion_auth';

let authKey;
if (fs.existsSync(authFile)) {
  authKey = fs.readFileSync(authFile, 'utf-8');
}
const api = new TionAPI({ email, password, authKey });

api.getDevices({ type: 'breezer3' })
  .then((devices) => {
    const [d] = devices;
    console.log(d.data.co2);
  })
  .catch((err) => {
    console.error(err);
  });
