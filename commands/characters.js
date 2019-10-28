const {
  destruct, 
  dataMap, 
  isWeapon, 
  isArmor, 
  isSlayer, 
  typeFilter, 
  slayerFilter,
  queryList,
  queryMap,
  tierFilter
} = require('./commands');
const flatten = require('ramda.flatten');

const getChar = (msg) => {
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
      };
      if(query_1 === 'type' && isWeapon(query_2)) {
        return typeFilter(query_2, item);
      };
      if(query_1 === 'slayer' && isSlayer(query_2)) {
        return slayerFilter(query_2, item);
      };
    });
    
    return rest[0] == 'tier' && isTier(rest[1]) ? tierFilter(rest, specificData) : specificData;
  };

  if(category == 'type' || category == 'slayer') {
    const deepSearch1 = category === 'slayer' && isSlayer(query_1) && query_2 === 'type' && isWeapon(rest[0]);
    const deepSearch2 = category === 'type' && isWeapon(query_1) && query_2 === 'slayer' && isSlayer(rest[0]);
    const unSpecificData = flatten(queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).map(item => {
        return items[subItem][item];
      });
    }))
    .reduce( (item, next, id, arr) => {
      if(deepSearch1 && slayerFilter(query_1, next) && typeFilter(rest[0], next)) {
        return item.concat(next);
      };
      if(deepSearch2 && typeFilter(query_1, next) && slayerFilter(rest[0], next)) {
        return item.concat(next);
      };
      if(rest.length == 0 && category === 'type' && isWeapon(query_1) && typeFilter(query_1, next)) {
        return item.concat(next);
      };
      if(rest.length == 0 && category === 'slayer' && isSlayer(query_1) && slayerFilter(query_1, next)) {
        return item.concat(next);
      };
      
      return item;
    }, []);
    console.log(unSpecificData.length)
    return query_2 == 'tier' && rest.length == 1 ? tierFilter([query_2, rest[0]], unSpecificData) : unSpecificData;
  };

  // invalid query
  return [{}]
};
