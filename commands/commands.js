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
          item['set_effect'].toLowerCase().indexOf(elemBuff) >= 0 : false;
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


const getWeapons = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ category, query_1, query_2, ...rest ] = queries;
  const requestItem = dataMap[command];

  const items = isWeapon(category) ? 
                 Object.keys(requestItem[category]).map( key => requestItem[category][key]) :
                 requestItem;
  
  if(queryList.includes(query_1)) {
    const specificData = items.filter( item => {
      if(query_1 === 'element' && isElement(query_2) && rest[0] === 'buff' && isBuff(rest[1])) {
        return elementFilter(query_2, item) && queryFilter(rest[1], item);
      }
      if(query_1 === 'element' && isElement(query_2)) {
        return elementFilter(query_2, item);
      }
      if(query_1 === 'buff' && isBuff(query_2)) {
        return queryFilter(query_2, item);
      }
    });
    
    return rest[0] == 'tier' && isTier(rest[1]) ? tierFilter(rest, specificData) : specificData;
  };

  if(category == 'element') {
    const unSpecificData = flatten(queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).map(item => {
        return items[subItem][item]
      });
    }))
    .filter( item => {
      if(category === 'element' && isElement(query_1) && query_2 === 'buff' && isBuff(rest[0])) {
        return elementFilter(query_1, item) && queryFilter(rest[0], item);
      };
      if(category === 'element' && isElement(query_1)) {
        return elementFilter(query_1, item);
      };
      if(category === 'buff' && isBuff(query_1)) {
        return queryFilter(query_1, item);
      };
    });
    
    return query_2 == 'tier' && rest.length == 1 ? tierFilter([query_2, rest[0]], unSpecificData) : unSpecificData;
  };
  // is this unreachable ?? 
  return [{}];
};


const getArmors = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ category, query_1, query_2, ...rest ] = queries;
  const requestItem = dataMap[command];

  const items = isArmor(category) ? 
                 Object.keys(requestItem[category]).map( key => requestItem[category][key]) :
                 requestItem;

  if(queryList.includes(query_1)) {
    const specificData = items.filter( item => {
      if(query_1 === 'type' && isWeapon(query_2) && rest[0] === 'slayer' && isSlayer(rest[1])) {
        return typeFilter(query_2, item) && slayerFilter(rest[1], item);
      }
      if(query_1 === 'type' && isWeapon(query_2)) {
        return typeFilter(query_2, item);
      }
      if(query_1 === 'slayer' && isSlayer(query_2)) {
        return slayerFilter(query_2, item);
      }
    })
    return rest[0] == 'tier' && isTier(rest[1]) ? tierFilter(rest, specificData) : specificData;
  };

  if(category == 'type' || category == 'slayer') {
    const unSpecificData = flatten(queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).map(item => {
        return items[subItem][item]
      });
    }))
    .filter( item => {
      if(category === 'type' && isWeapon(query_1) && query_2 === 'slayer' && isSlayer(rest[0])) {
        return typeFilter(query_1, item) && slayerFilter(rest[0], item);
      }
      if(category === 'type' && isWeapon(query_1)) {
        return typeFilter(query_1, item);
      }
      if(category === 'slayer' && isSlayer(query_1)) {
        return slayerFilter(query_1, item);
      }
    })
    
    return query_2 == 'tier' && rest.length == 1 ? tierFilter([query_2, rest[0]], unSpecificData) : unSpecificData;
  };
  // is this unreachable ?? 
  return [{}];
};



module.exports = { 
  isCommand, 
  isQuery, 
  isBuff,
  isElement,
  isArmor,
  isSlayer,
  queryMap,
  getCommand, 
  getWeapons,
  getArmors,
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