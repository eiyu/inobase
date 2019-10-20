const yaml = require('js-yaml');
const fs   = require('fs');
const WEAPON_TYPES = ['blade', 'focus', 'hammer', 'instrument', 'polearm', 'ranged', 'staff', 'tome']
let weapons = {};

try {
  WEAPON_TYPES.forEach(type => {
    const file = fs.readFileSync(`./data/weapons/${type}.yml`, 'utf8');
    Object.assign(weapons, {
      [type]:  yaml.safeLoad(file)
    });
  });
} catch (e) {
  console.log(e);
}

module.exports = { ...weapons }
