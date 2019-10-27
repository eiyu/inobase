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
  'nhms',
  'characters',
  'nhm',
  'dhelp'
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

// every buff must be registered here
const buffList = {
  'matk': 'increase own magical ATK',
  'patk': 'increase own physical ATK',
  'mdef': 'increase own magical DEF',
  'pdef': 'increase own physical DEF',
  'spcost': 'sp cost of',
  'hit': 'hit rate of',
  'spres': 'of max SP',
  'hpres': 'of max HP'
};

const daringList = {
  'dc1': "slightly increase damage",
  'dc2': "moderately increase damage",
  'dc3': "greatly increase damage",
  'sb1': "slightly increase support",
  'sb2': "moderately increase support",
  'sb3': "greatly increase support",
  'rb1': "slightly increase hp",
  'rb2': "moderately increase hp",
  'rb3': "greatly increase hp"
};

const nightmareElement = {
  'wind': 'increases the effectiveness of Wind',
  'water': 'increases the effectiveness of Water',
  'fire': 'increases the effectiveness of Fire'
};

const nightmareBuff = {
  'matk': 'raise magical attack',
  'patk': 'raise physical attack',
  'mdef': 'raise magical defense',
  'pdef': 'raise physical defense',
  'spcost': 'sp cost of',
  'hit': 'hit rate of',
  'spres': 'of max sp',
  'hpres': 'of max hp'
};

const tierList = [
  'ss',
  's',
  'a'
];


// const charNames = flatten(getDataNames(dataMap['characters']));

const getDataNames = data => Object.keys(data).map(job => {
  return Object.keys(data[job]);
});

// const armorNames = flatten(getDataNames(dataMap['armors']));
// const weaponNames = flatten(getDataNames(dataMap['weapons']));
const nhmNames = flatten(getDataNames(dataMap['nightmares']));
// const allNames = [...armorNames, ...weaponNames, ...nhmNames];

const queryMap = {
  'weapons': weaponList, 
  'armors': armorList, 
  'characters': charJobList,
  // 'nightmares': nhmNames,
  'query': queryList, 
  'element': elementList,
  'tier': tierList,
  'buff': Object.keys(buffList),
  'slayer': enemiesTypeList,
  'daring': Object.keys(daringList)
};



// utilities
const validator = (setName, word) => {
  const res = setName.get(word);
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

const destructWithNhmName = msg => {
  const [prefix, ...rest] = msg.replace(/ {1,}/g," ");;
  const commands = rest.join('').split(' ');
  const [command, ...queries] = commands;
  return {
    'prefix': prefix,
    'command': validator(commandSet, command),
    'queries': queries.map(item => validator(nightmaresNameSet, item))
  };
};


const getCommand = msg => {
  const { command } = destruct(msg);
  return command;
};

const chunk = (array, size) => {
  if (!array) return [];
  const firstChunk = array.slice(0, size); 
  if (!firstChunk.length) {
    return array; 
  }
  return [firstChunk].concat(chunk(array.slice(size, array.length), size)); 
}

// predicates
const is = curry((name, patch, value) => {
    const localSet = patch.hasOwnProperty(value);
    return queryMap[name].includes(value) || localSet;
});
const isQuery = is('query', false);
const isWeapon = is('weapons', false);
const isArmor = is('armors', false);
const isElement = is('element', false);
// const isTier = is('tier', false);
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

const getDaring = msg => {
  const wordList = msg.split(' ');
  const lastWord = wordList[wordList.length -1];
  const darings = Object.keys(daringList);
  return darings.find((item) => item == lastWord);
};

// filters
const queryFilter = (query, item) => {
  return item ? item['col_aid_skill'].indexOf(buffList[query]) >= 0 ||
          item['colosseum_skill'].indexOf(buffList[query]) >= 0 : false;
};

const slayerFilter = (query, item) => {
  const elemBuff = elementBuff[query];
  return item ? item['colosseum_skill'].toLowerCase().indexOf(query) >= 0 ||
          (item['col_aid_skill'].toLowerCase().indexOf(query) >= 0 || item['col_aid_skill'].toLowerCase().indexOf(elemBuff) >= 0 ): false;
};

const nightmareFilter = (data, query, item) => {
  const elemBuff = data[query];
  return item ? item['colosseum_skill'].toLowerCase().indexOf(query) >= 0 ||
          (item['col_aid_skill'].toLowerCase().indexOf(query) >= 0 || item['col_aid_skill'].toLowerCase().indexOf(elemBuff) >= 0 ): false;
};

const daringFilter = (query, item) => {
  const daring = daringList[query];
  return item ? item['col_aid_skill'].toLowerCase().indexOf(daring) >= 0 : false;
}


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

const buildSetArr = (list, cb) => {
  return fuzzyset(list, false);
};


// fuzzyset instances
const commandSet = buildSetArr(commandList);
const querySet = buildSetObj(queryMap);
// const dataSet = buildSetArr(allNames);
const nightmaresNameSet = buildSetArr(nhmNames);


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
  tierFilter,
  chunk,
  nightmareFilter,
  nightmareBuff,
  nightmareElement,
  nightmaresNameSet,
  destructWithNhmName,
  daringFilter,
  getDaring
};