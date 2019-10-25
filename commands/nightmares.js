const {
  destruct, 
  dataMap, 
  isSlayer, 
  isBuff, 
  nightmareFilter,
  nightmareBuff,
  nightmareElement
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
  return [{}]
};

module.exports = { getNhm };
// getNhm({content: "?nightm eleme fire buff patk"});
// getNhm({content: "?nightm buff patk eleme fire "});
// getNhm({content: "?nightm buff patk"});
// getNhm({content: "?nightm buff pdef"});
getNhm({content: "?nightm buff hpr"});
getNhm({content: "?nightm buff spr"});
getNhm({content: "?nightm buff spc"});
// getNhm({content: "?nightm eleme fire "});

// console.log(e.length, f.length, g.length, h.length)