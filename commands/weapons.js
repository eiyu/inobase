const {
  destruct, 
  dataMap, 
  queryFilter, 
  isElement, 
  isBuff, 
  elementFilter,
  isWeapon,
  queryList,
  queryMap,
  tierFilter
} = require('./lib');
const flatten = require('ramda.flatten');

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
      };
      if(query_1 === 'buff' && isBuff(query_2) && rest[0] === 'element' && isElement(rest[1])) {
        return queryFilter(query_2, item) && elementFilter(rest[1], item);
      };
      if(query_1 === 'element' && isElement(query_2)) {
        return elementFilter(query_2, item);
      };
      if(query_1 === 'buff' && isBuff(query_2)) {
        return queryFilter(query_2, item);
      };
    });
    return rest[0] == 'tier' && isTier(rest[1]) ? tierFilter(rest, specificData) : specificData;
  };

  if(category == 'element' || category == 'buff') {
    const deepSearch1 = category === 'element' && isElement(query_1) && query_2 === 'buff' && isBuff(rest[0]);
    const deepSearch2 = category === 'buff' && isBuff(query_1,items) && query_2 === 'element' && isElement(rest[0]);
    const unSpecificData = flatten(queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).map(item => {
        return items[subItem][item];
      });
    }))
    .reduce( (item, next) => {
      if(deepSearch1 && elementFilter(query_1, next) && queryFilter(rest[0], next)) {
        return item.concat(next);
      };
      if(deepSearch2 && queryFilter(query_1, next) && elementFilter(rest[0], next)) {
        return item.concat(next);
      };
      if(rest.length == 0 && category === 'buff' && isBuff(query_1) && queryFilter(query_1, next)) {
        return item.concat(next);
      };
      if(rest.length == 0 && category === 'element' && isElement(query_1) && elementFilter(query_1, next)) {
        return item.concat(next);
      };
      return item;
    }, []);
    return query_2 == 'tier' && rest.length == 1 ? tierFilter([query_2, rest[0]], unSpecificData) : unSpecificData;
  };
  // invalid query
  return [{
    err: "Invalid Query"
  }];
};

module.exports = { getWeapons };

const a = getWeapons({content: "?weap blade buff patk elem wat"}); 
const b = getWeapons({content: "?weap blade elem wat buff patk"});
const c = getWeapons({content: "?weap buff patk elem wat"});
const d = getWeapons({content: "?weap elem wat buff patk"});
const e = getWeapons({content: "?weap buff patk elem"});
const f = getWeapons({content: "?weap elem wat buff"});
const g = getWeapons({content: "?weap buff patk"});
const h = getWeapons({content: "?weap elem wat"});

console.log(a.length, b.length, c.length, d.length, e.length, f.length, g.length, h.length)