const fuzzyset = require('fuzzyset.js');
const flatten = require('ramda.flatten');
const curry = require('ramda.curry');

const commandList = [
  'weapons',
  'armors',
  'nightmares',
  'chars'
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

const queryList = [
  'element',
  'buff',
  'tier'
];

const elementList = [
  'water',
  'wind',
  'fire',
  /*
  'physical',
  'magic',
  'def'
  */
];

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
  'query': queryList, 
  'element': elementList,
  'tier': tierList,
  'buff': Object.keys(buffList)
};



// fuzzyset instances
const buildQuerySet = querymap => {
  const res = new fuzzyset();
  for (const prop in queryMap) {
    queryMap[prop].forEach(word => { res.add(word) })
  };
  return res;
};

const buildCommandSet = list => {
  const res = new fuzzyset();
  list.forEach(word => {
    res.add(word)
  })
  return res;
}
const commandSet = buildCommandSet(commandList)
const querySet = buildQuerySet(queryMap);



// utilities
const validator = (setName, word) => {
  const res = setName.get(word);
  // console.log(res);
  return res[0][1];
};

const destruct = msg => {
  const [prefix, ...rest] = msg;
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
const is = name => value => queryMap[name].includes(value);
const isQuery = is('query');
const isWeapon = is('weapons');
const isElement = is('element');
const isTier = is('tier');

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
const queryFilter = curry((query, item) => {
  return item['aid_skill'].indexOf(buffList[query]) >= 0 ||
    item['story_skill'].indexOf(buffList[query]) >= 0 ||
    item['colosseum_skill'].indexOf(buffList[query]) >= 0;
});

const elementFilter = (val, item) => item['element'].toLowerCase() == val
const tierFilter = ([tier, value], items) => {
  return items.filter( item => item[tier] && item[tier].toLowerCase() == value.toLowerCase() )
}



const getResult = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ category, query_1, query_2, ...rest ] = queries;
  const requestItem = require(`./${command}`)

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
    })
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
      }
      if(category === 'element' && isElement(query_1)) {
        return elementFilter(query_1, item);
      }
      if(category === 'buff' && isBuff(query_1)) {
        return queryFilter(query_1, item);
      }
    })
    console.log(unSpecificData.length)
    return query_2 == 'tier' && rest.length == 1 ? tierFilter([query_2, rest[0]], unSpecificData) : unSpecificData;
  };
  // is this unreachable ?? 
  return [{}];
};

module.exports = { 
  isCommand, 
  isQuery, 
  isElement, 
  getCommand, 
  getResult, 
  commandList, 
  queryList, 
  destruct, 
  isWeapon 
};