const Discord = require('discord.js');
const ReactionMenu = require('discord.js-reaction-menu');
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
  chunk
} = require('./lib');
const flatten = require('ramda.flatten');


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
      return `\`${('000' + (id + 1 + (i*8))).slice(-2)}.\` [${item.name}](${item.url.split('\n').join('')})`;
    }).join('\n'));
    return [searchRes];
  };

  const chunked = chunk(data, 8);
  const pages = chunked.map((subArr, i, arr) => {
    return new Discord.RichEmbed()
    .setTitle(`Search result for ${command} ${query_1}, I found ${data.length} item                -              [Page ${i+1}/${arr.length} ]`)
    .setDescription(subArr.map((item, id) => {
      const url = item.url.replace('(','%28').replace(')', '%29')
      return `\`${('000' + (id + 1 + (i*8))).slice(-2)}.\`[${item.name}](${url})`;
    }));
  });
  return pages;
};


const getArmors = (msg) => {
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
      if(query_1 === 'slayer' && isSlayer(query_2) && rest[0] === 'type' && isWeapon(rest[1])) {
        return slayerFilter(query_2, item) && typeFilter(rest[1], item);
      };
      if(query_1 === 'type' && isWeapon(query_2)) {
        return typeFilter(query_2, item);
      };
      if(query_1 === 'slayer' && isSlayer(query_2)) {
        return slayerFilter(query_2, item);
      };
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

  if(category == 'type' || category == 'slayer') {
    const deepSearch1 = category === 'slayer' && isSlayer(query_1) && query_2 === 'type' && isWeapon(rest[0]);
    const deepSearch2 = category === 'type' && isWeapon(query_1) && query_2 === 'slayer' && isSlayer(rest[0]);
    
    const unSpecificData = flatten(queryMap[command].map(subItem => {
      return Object.keys(items[subItem]).map(item => {
        return items[subItem][item];
      });
    }))
    .reduce( (item, next) => {
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
  return [{
    err: "Invalid Query"
  }];
};

module.exports = { getArmors };
