const weapons = require('./weapons');

const commandList = [
  'weapon',
  'armor',
  'nightmare',
  'char'
];

const queryList = [
  'element',
  'type',
  'buff'
];

const elementList = [
  'water',
  'wind',
  'fire',
];

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
  return prefix === '?' && commandList.find(item => item === command) == command;
};

const getCommand = msg => {
  const { command } = destruct(msg);
  return command;
};

const getQueries = msg => {
  const { command, queries } = destruct(msg);
  const items = Object.keys(weapons[queries[0]]).map( key => weapons[queries[0]][key]);
  
  if(queryList.find( item => item === queries[1])) {
    const specificData = items.filter( item => {
      // query element -> add query[1] to fuzzyset
      if(queries[1] === 'element') {
        return queries[2] ? item['element'].toLowerCase() === queries[2].toLowerCase() : "baaa";
      };
      if(queries[1] === 'buff') {
        return queries[2] ? item['aid_skill']
                .toLowerCase()
                .split(' ')
                .includes(queries[2].toLowerCase()) ||
                item['story_skill'] 
                .toLowerCase()
                .split(' ')
                .includes(queries[2].toLowerCase()) ||
                item['colosseum_skill'] 
                .toLowerCase()
                .split(' ')
                .includes(queries[2].toLowerCase()) : "baaa";
      };
    });
    return specificData
  };
  return `Please provide specific query eg: ?${command} ${queries[0]} <query1> <query2>`;
};

module.exports = { isCommand, getCommand, getQueries, commandList, queryList }