const yaml = require('js-yaml');
const fs   = require('fs');
const NIGHTMARES = ['nightmares']
let nightmares = {};

try {
  NIGHTMARES.forEach(type => {
    const file = fs.readFileSync(`./data/nightmares/${type}.yml`, 'utf8');
    Object.assign(nightmares, {
      [type]:  yaml.safeLoad(file)
    });
  });
} catch (e) {
  console.log(e);
}

module.exports = { ...nightmares }
