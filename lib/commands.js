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

const destruct = msg => {
  const [prefix, ...rest] = msg;
  const commands = rest.join('').split(' ');
  const [command, ...queries] = commands;
  
  return {
    prefix,
    command,
    queries
  };
};

const isCommand = msg => {
  const { prefix, command } = destruct(msg);
  return prefix === '?' && commandList.includes(command);
};

const is = name => value => queryMap[name].includes(value);
const isQuery = is('query');
const isWeapon = is('weapons');
const isSearch = is('search');
const isTier = is('tier');

const getCommand = msg => {
  const { command } = destruct(msg);
  return command;
};

const queryFilter = (val, query) => {
  return val['aid_skill']
        .toLowerCase()
        .split(' ')
        .includes(query.toLowerCase()) ||
        val['story_skill'] 
        .toLowerCase()
        .split(' ')
        .includes(query.toLowerCase()) ||
        val['colosseum_skill'] 
        .toLowerCase()
        .split(' ')
        .includes(query.toLowerCase());
};

const getResult = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ query_1, query_2, query_3 ] = queries;
  const requestAllItem = require(`./${command}`)
  const items = isWeapon(query_1) ? 
                Object.keys(requestAllItem[query_1]).map( key => requestAllItem[query_1][key]) :
                requestAllItem;
  
  if(queryList.includes(query_2)) {
    const specificData = items.filter( item => {
      if(query_2 === 'element') {
        return isSearch(query_3) ? item['element'].toLowerCase() === query_3.toLowerCase() : item;
      };
      if(query_2 === 'buff') {
        return isSearch(query_3) ? queryFilter(item, query_3) : item;
      };
    });
    return specificData;
  };

  if(searchtList.includes(query_2)) {
    const unSpecificData = queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).reduce((item, next) => {
        const value = items[subItem][next]
        if(query_1 === 'element' && value['element'].toLowerCase() === query_2.toLowerCase()) {
          item = value
        };
        if(query_1 === 'buff' && queryFilter(value, query_2)) {
          item = value
        };
        return item
      }, {});
    });

    return unSpecificData;
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