const fuzzyset = require('fuzzyset.js');
const flatten = require('ramda.flatten');
const curry = require('ramda.curry');

const dataMap = {
  'armors': require('../data/armors'),
  'characters': require('../data/characters'),
  'weapons': require('../data/weapons'),
  'nightmares': require('../data/nightmares')
}

const commandList = [
  'weapons',
  'armors',
  'nightmares',
  'characters'
];

const weaponList = [
  'blade',
  'focus',
  'hammer',
  'instrument',
  'polearm',
  'ranged',
  'staff',
  'tome'
];

const armorList = [
  'head',
  'hands',
  'body',
  'feet',
];

const charJobList = [
  'alternative', 'another', 
  'breaker', 'cleric', 
  'crusher', 'gunner', 
  'half_nightmare', 'kimono',
  'minstrel', 'paladin', 
  'sorcerer', 'tuna_cleric', 
  'tuna_paladin'
];
const nhmList = ['nightmares']

const queryList = [
  'element',
  'buff',
  'tier',
  'type',
  'slayer'
];

const elementList = [
  'water',
  'wind',
  'fire',
];

const enemiesTypeList = [
  'beasts',
  'plants',
  'birds',
  'dragons',
  'orcs',
  'humans',
  'wisps',
  'ghosts',
  'machine',
  'lifeforms',
  'emil',
  'monster[dod3]'
];

const elementBuff = {
  'wind': 'wind-element',
  'water': 'water-element',
  'fire': 'fire-element'
};

const buffList = {
  'matk': 'increase own magical ATK',
  'patk': 'increase own physical ATK',
  'mdef': "increase own magical DEF",
  'pdef': "increase own physical DEF",
};

const tierList = [
  'ss',
  's',
  'a'
];

const queryMap = {
  'weapons': weaponList, 
  'armors': armorList, 
  'characters': charJobList,
  'nightmares': nhmList,
  'query': queryList, 
  'element': elementList,
  'tier': tierList,
  'buff': Object.keys(buffList),
  'slayer': enemiesTypeList,
};



// utilities
const validator = (setName, word) => {
  const res = setName.get(word);
  // returns fuzzyset get method results
  return res ? res[0][1] : false;
};

const destruct = msg => {
  const [prefix, ...rest] = msg.replace(/ {1,}/g," ");;
  const commands = rest.join('').split(' ');
  const [command, ...queries] = commands;
  // get rid toLowerCase method
  return {
    'prefix': prefix,
    'command': validator(commandSet, command),
    'queries': queries.map(item => validator(querySet, item))
  };
};

const getCommand = msg => {
  const { command } = destruct(msg);
  return command;
};




// predicates
const is = curry((name, patch, value) => {
    const localSet = patch.hasOwnProperty(value);
    return queryMap[name].includes(value) || localSet;
});
const isQuery = is('query', false);
const isWeapon = is('weapons', false);
const isArmor = is('armors', false);
const isElement = is('element', false);
const isTier = is('tier', false);
const isSlayer = is('slayer', elementBuff);

const isBuff = (value) => {
  if(!buffList.hasOwnProperty(value)) {
    return false;
  };
  return true;
};

const isCommand = msg => {
  const { prefix, command } = destruct(msg);
  return prefix === '?' && commandList.includes(command);
};



// filters
const queryFilter = (query, item) => {
  return item ? item['col_aid_skill'].indexOf(buffList[query]) >= 0 ||
          item['colosseum_skill'].indexOf(buffList[query]) >= 0 : false;
};

const slayerFilter = (query, item) => {
  const elemBuff = elementBuff[query];
  return item ? item['story_skill'].toLowerCase().indexOf(query) >= 0 ||
          (item['set_effect'].toLowerCase().indexOf(query) >= 0 || item['set_effect'].toLowerCase().indexOf(elemBuff) >= 0 ): false;
};

const typeFilter = curry((type, item) => item ? item['weapon_type'].toLowerCase() == type : false);
const elementFilter = curry((val, item) => item ? item['element'].toLowerCase() == val : false);
const tierFilter = curry(([tier, value], items) => {
  return items.filter( item => item[tier] && item[tier].toLowerCase() == value.toLowerCase() )
});


// fuzzyset 
const buildSetObj = querymap => {
  const res = new fuzzyset();
  for (const prop in querymap) {
    querymap[prop].forEach(word => { res.add(word) })
  };
  return res;
};

const buildSetArr = list => {
  const res = new fuzzyset();
  list.forEach(word => {
    res.add(word)
  })
  return res;
}

const getDataNames = data => Object.keys(data).map(job => {
  return Object.keys(data[job]);
});

const charNames = flatten(getDataNames(dataMap['characters']));
const armorNames = flatten(getDataNames(dataMap['armors']));
const weaponNames = flatten(getDataNames(dataMap['weapons']));
const nhmNames = flatten(getDataNames(dataMap['nightmares']));
const allNames = [...charNames, ...armorNames, ...weaponNames, ...nhmNames];

// fuzzyset instances
const commandSet = buildSetArr(commandList);
const querySet = buildSetObj(queryMap);
const dataSet = buildSetArr(allNames);


module.exports = { 
  isCommand, 
  isQuery, 
  isBuff,
  isElement,
  isArmor,
  isSlayer,
  queryMap,
  getCommand,
  commandList, 
  queryList, 
  destruct, 
  isWeapon,
  dataMap,
  elementFilter,
  queryFilter,
  typeFilter,
  slayerFilter,
  tierFilter
};