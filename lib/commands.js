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

const queryList = [
  'element',
  'buff'
];

const searchtList = [
  'water',
  'wind',
  'fire',
  'physical',
  'magic',
  'def',
];

const queryMap = {
  'weapon': weaponList, 
  'query': queryList, 
  'search': searchtList
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

const is = name => value => queryMap[name].includes(value)
const isQuery = is('query');
const isWeapon = is('weapon');
const isSearch = is('search');

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
}

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
        return query_3 ? item['element'].toLowerCase() === query_3.toLowerCase() : "baaa";
      };
      if(query_2 === 'buff') {
        return query_3 ? queryFilter(item, query_3) : "baaa";
      };
    });
    // console.log(specificData)
    return specificData
  };

  if(searchtList.includes(query_2)) {
    const unSpecificData = Object.keys(items).map(subItem => {
      return Object.keys(items[subItem]).reduce((item, next) => {
        const value = items[subItem][next]
        if(query_1 === 'element' && value['element'].toLowerCase() === query_2.toLowerCase()) {
          item = items[subItem][next]
        };
        if(query_1 === 'buff' && queryFilter(value, query_2)) {
          item = items[subItem][next]
        };
        return item
      }, {});
    });

    // console.log(unSpecificData.length)
    return unSpecificData
  }
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
}