const yaml = require('js-yaml');
const fs   = require('fs');
const CHAR_TYPES = [
  'alternative', 'another', 
  'breaker', 'cleric', 
  'crusher', 'gunner', 
  'half_nightmare', 'kimono',
  'minstrel', 'paladin', 
  'sorcerer', 'tuna_cleric', 
  'tuna_paladin'
]
let characters = {};

try {
  CHAR_TYPES.forEach(type => {
    const file = fs.readFileSync(`./assets/characters/${type}.yml`, 'utf8');
    Object.assign(characters, {
      [type]:  yaml.safeLoad(file)
    });
  });
} catch (e) {
  console.log(e);
}

module.exports = { ...characters }
