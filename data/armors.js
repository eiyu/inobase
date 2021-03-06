const yaml = require('js-yaml');
const fs   = require('fs');
const ARMOR_TYPES = ['body', 'feet', 'hands', 'head']
let armors = {};

try {
  ARMOR_TYPES.forEach(type => {
    const file = fs.readFileSync(`./assets/armors/${type}.yml`, 'utf8');
    Object.assign(armors, {
      [type]:  yaml.safeLoad(file)
    });
  });
} catch (e) {
  console.log(e);
}

module.exports = { ...armors }
