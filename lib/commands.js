const fuzzyset = require('fuzzyset.js');
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

const searchtList = [
  'water',
  'wind',
  'fire',
  'physical',
  'magic',
  'def'
];

const tierList = [
  'ss',
  's',
  'a'
];

const queryMap = {
  'weapons': weaponList, 
  'armors': armorList, 
  'query': queryList, 
  'search': searchtList,
  'tier': tierList
};

// banish all the toLowerCase method!!
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

const validator = (setName, word) => {
  const res = setName.get(word);
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

const isCommand = msg => {
  const { prefix, command } = destruct(msg);
  return prefix === '?' && commandList.includes(command);
};

const getCommand = msg => {
  const { command } = destruct(msg);
  return command;
};

const is = name => value => queryMap[name].includes(value);
const isQuery = is('query');
const isWeapon = is('weapons');
const isSearch = is('search');
const isTier = is('tier');

const queryFilter = (val, query) => {
  return val['aid_skill']
        .toLowerCase()
        .split(' ')
        .includes(query) ||
        val['story_skill'] 
        .toLowerCase()
        .split(' ')
        .includes(query) ||
        val['colosseum_skill'] 
        .toLowerCase()
        .split(' ')
        .includes(query);
};

const tierFilter = ([tier, value], items) => {
  return items.filter( item => item[tier] && item[tier].toLowerCase() == value.toLowerCase() )
}

const getResult = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ query_1, query_2, query_3, ...tier ] = queries;
  const requestAllItem = require(`./${command}`)
  const items = isWeapon(query_1) ? 
                Object.keys(requestAllItem[query_1]).map( key => requestAllItem[query_1][key]) :
                requestAllItem;
  
  if(queryList.includes(query_2)) {
    const specificData = items.filter( item => {
      if(query_2 === 'element') {
        return isSearch(query_3) ? item['element'].toLowerCase() === query_3 : item;
      };
      if(query_2 === 'buff') {
        return isSearch(query_3) ? queryFilter(item, query_3) : item;
      };
    });
    return tier.length == 2 ? tierFilter(tier, specificData) : specificData;
  };

  if(searchtList.includes(query_2)) {
    const unSpecificData = queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).reduce((item, next) => {
        const value = items[subItem][next]
        if(query_1 === 'element' && value['element'].toLowerCase() === query_2) {
          item = value
        };
        if(query_1 === 'buff' && queryFilter(value, query_2)) {
          item = value
        };
        return item
      }, {});
    }).filter(item => command != 'char' && item.tier);
    console.log(unSpecificData)
    return query_3 == 'tier' && tier.length == 1 ? tierFilter([query_3, tier[0]], unSpecificData) : unSpecificData;
  };
  // is this unreachable ?? 
  return [{}];
};

module.exports = { 
  isCommand, 
  isQuery, 
  isSearch, 
  getCommand, 
  getResult, 
  commandList, 
  queryList, 
  destruct, 
  isWeapon 
};