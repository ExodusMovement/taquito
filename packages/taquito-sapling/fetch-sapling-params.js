/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs'
import axios from 'axios'

const ZCASH_DOWNLOAD_URL = 'https://download.z.cash/downloads';
const ZCASH_SPEND_PARAMS_FILE_NAME = 'sapling-spend.params';
const ZCASH_OUTPUT_PARAMS_FILE_NAME = 'sapling-output.params';
const SPEND_PARAMS = 'saplingSpendParams';
const OUTPUT_PARAMS = 'saplingOutputParams';

async function fetchSaplingParams(url, name) {

  const response = await axios.get(`${ZCASH_DOWNLOAD_URL}/${url}`, {
    responseType: 'arraybuffer',
  });

  fs.writeFile(`${name}.js`, `
  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
    // AMD Module
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
    // Node Module
        module.exports = factory();
    } else {
    // Browser Global
        root.returnExports = factory();
  }
}(this, function () {
    return {
      "${name}": "${response.data.toString('base64')}"
    };
}));
    `, (err) => {
    if (err) return console.log(err);
    console.log(`The file ${name} has been saved!`);
  });
}

fetchSaplingParams(ZCASH_SPEND_PARAMS_FILE_NAME, SPEND_PARAMS);
fetchSaplingParams(ZCASH_OUTPUT_PARAMS_FILE_NAME, OUTPUT_PARAMS);