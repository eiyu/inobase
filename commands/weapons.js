const Discord = require('discord.js');
const ReactionMenu = require('discord.js-reaction-menu');
const flatten = require('ramda.flatten');
const {
  destructQuerySet, 
  dataMap, 
  queryFilter, 
  isElement, 
  isBuff, 
  elementFilter,
  isWeapon,
  queryList,
  queryMap,
  chunk,
  daringFilter,
  getDaring,
  destructWithWeaponName
} = require('./lib');

const buildEmbedForItem = (itemData) => {
  if (!itemData.hasOwnProperty('element')) {
    return;
  };
  return new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle(`${itemData['name']}`)
    .setURL(`${itemData['url']}`)
    .setDescription(`Element: ${itemData['element']}`)
    .setThumbnail(`${itemData['picture']}`)
    .addField('Colosseum Skill', `${itemData['colosseum_skill']}`, true)
    .addField('Aid Skill', `${itemData['col_aid_skill']}`, true)
    .addField('Stats', `PATK: ${itemData['patk']} \n MATK: ${itemData['matk']} \n PDEF: ${itemData['pdef']} \n MDEF: ${itemData['mdef']} \n` , true)
    .setFooter('This is all I can give to you for now, for more details you can visit the link above');;
};

const searchEmbed = (data, command, query_1, q2) => {
  if(data.length === 0) {
    return;
  };
  if(data.length <= 8) {
    const searchRes = new Discord.RichEmbed();
    searchRes.setTitle(`Search result for ${command} ${query_1} ${q2}`);
    searchRes.setDescription(data.map((item,id) => {
      return `\`${('000' + (id + 1)).slice(-2)}.\` [${item.name}](${item.url.split('\n').join('')})`;
    }).join('\n'));
    return [searchRes];
  };

  const chunked = chunk(data, 8);
  const pages = chunked.map((subArr, i, arr) => {
    return new Discord.RichEmbed()
    .setTitle(`Search result for ${command} ${query_1}, I found ${data.length} item \n[Page ${i+1}/${arr.length} ]`)
    .setDescription(subArr.map((item, id) => {
      const url = item.url.replace('(','%28').replace(')', '%29')
      return `\`${('000' + (id + 1 + (i*8))).slice(-2)}.\`[${item.name}](${url})`;
    }));
  });
  return pages;
};


const getWeapons = (msg) => {
  const { command, queries } = destructQuerySet(msg.content);
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
    }).filter(item => {
      return !!getDaring(msg.content) ? daringFilter(getDaring(msg.content), item) : false;
    });

    if(specificData.length > 0) {
      new ReactionMenu.menu(
        msg.channel,
        msg.author.id,
        specificData ? [...searchEmbed(specificData, command, query_1, query_2) ,...specificData.map(item => buildEmbedForItem(item))] : false,
        120000
        );
      };
    return;
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
    }, []).filter(item => {
      return !!getDaring(msg.content) ? daringFilter(getDaring(msg.content), item) : false;
    });

    if(unSpecificData.length > 0) {
      new ReactionMenu.menu(
        msg.channel,
        msg.author.id,
        unSpecificData ? [...searchEmbed(unSpecificData, command, query_1, query_2) ,...unSpecificData.map(item => buildEmbedForItem(item))] : false,
        120000
      );
    };
    return;
  };
  // invalid query
  msg.channel.send("Invalid query");
};


getWeaponName = (msg) => {
  const { command, queries } = destructWithWeaponName(msg.content);
  const weaponsObj = dataMap['weapons'];
  const flattenObj = flatten(weaponsObj);
  console.log(weaponsObj)

  const weapon = flattenObj[queries[0]];
  if(command !== 'weap' || !weapon) {
      return;
  };
  
  // new ReactionMenu.menu(
  //   msg.channel,
  //   msg.author.id,
  //   [buildEmbed(nightmare)],
  //   120000,
  //   {}
  // );
  return;
};

console.log(getWeaponName({content: "?weap swordofhe"}))

module.exports = { getWeapons, getWeaponName };
