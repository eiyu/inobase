const fuzzyset = require('fuzzyset.js');
const {
  destruct, 
  dataMap, 
  isSlayer, 
  isBuff, 
  nightmareFilter,
  nightmareBuff,
  nightmareElement,
  allNighMares
} = require('./lib');
const flatten = require('ramda.flatten');

const getNhm = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ category, query_1, query_2, ...rest ] = queries;
  const nhmsObj = dataMap[command][command]
  const nightmares = Object.keys(nhmsObj).map(name => nhmsObj[name]);
  // only take buff as argument
  // console.log(queries, queryList.includes(query_1))
  // console.log(isBuff(query_1))
  if(category == 'element' || category == 'buff') {
    const unSpecificData = nightmares.reduce( (item, next) => {
      if(category === 'buff' && isBuff(query_1) && nightmareFilter(nightmareBuff, query_1, next)) {
        return item.concat(next);
      };
      if(category === 'element' && isSlayer(query_1) && nightmareFilter(nightmareElement, query_1, next)) {
        return item.concat(next);
      };
      return item;
    }, []);
    console.log(unSpecificData.length)
    return unSpecificData;
  };
  return [{}];
};

getNhmName = (msg) => {
  const { command, queries } = destruct(msg.content);
  const nhmsObj = dataMap['nightmares']['nightmares']

  console.log(command, queries);
  if(command === 'nhm') {
    const nightmare = nhmsObj[queries[0]];
    return [nightmare]
  };
  
};

module.exports = { getNhm, getNhmName };
getNhmName({content: "?nhm thelo"});
