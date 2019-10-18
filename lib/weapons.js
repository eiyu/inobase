const yaml = require('js-yaml');
const fs   = require('fs');
const FuzzySet = require('fuzzyset.js')

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


const setItem = new FuzzySet();
const bladesSet = weapons['blade'];
Object.keys(bladesSet).forEach(name => {
  setItem.add(name);
});

const swords = setItem.get('Sword of ');
const results = swords.map(sword => {
  return bladesSet[sword[1]]
})

module.exports = { ...weapons }
