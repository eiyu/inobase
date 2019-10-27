const Discord = require('discord.js');
const ReactionMenu = require('discord.js-reaction-menu');
const {
  destruct, 
  dataMap, 
  isSlayer, 
  isBuff, 
  nightmareFilter,
  nightmareBuff,
  nightmareElement,
  chunk,
  destructWithNhmName
} = require('./lib');

const buildEmbed = data => {
  if (!data.hasOwnProperty('l_matk')) {
    return;
  };
  return new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle(`${data['name']}`)
    .setURL(`${data['url']}`)
    .setThumbnail(`${data['picture']}`)
    .addField('Skill 1', `${data['colosseum_skill']}`, true)
    .addField('Skill 2', `${data['col_aid_skill']}`, true)
    .addField('Stats', `PATK: ${data['patk']} \n MATK: ${data['matk']} \n PDEF: ${data['pdef']} \n MDEF: ${data['mdef']} \n` , true)
    .addField('Stats lv up', `PATK: ${data['l_patk']} \n MATK: ${data['l_matk']} \n PDEF: ${data['l_pdef']} \n MDEF: ${data['l_mdef']} \n` , true)
    .setFooter('This is all I can give to you for now, for more details you can visit the link above');
};


const searchEmbed = (data, command, query_1) => {
  if(data.length === 0) {
    return;
  };
  if(data.length <= 8) {
    const searchRes = new Discord.RichEmbed();
    searchRes.setTitle(`Search result for ${command} ${query_1}`);
    searchRes.setDescription(data.map((item,id) => {
      return `\`${('000' + (id + 1)).slice(-2)}.\` [${item.name}](${item.url.split('\n').join('')})`;
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


const getNhm = (msg) => {
  const { command, queries } = destruct(msg.content);
  const [ category, query_1] = queries;
  const path = {nhms:'nightmares'}
  const nhmsObj = dataMap[path[command]][path[command]]
  const nightmares = Object.keys(nhmsObj).map(name => nhmsObj[name]);
  
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
    if(unSpecificData.length > 0) {
      new ReactionMenu.menu(
        msg.channel,
        msg.author.id,
        unSpecificData ? [...searchEmbed(unSpecificData, path[command], query_1) ,...unSpecificData.map(item => buildEmbed(item))] : false,
        120000
        );

      };
      return;
    };
    return;
  };

getNhmName = (msg) => {
  const { command, queries } = destructWithNhmName(msg.content);
  const nhmsObj = dataMap['nightmares']['nightmares'];

  const nightmare = nhmsObj[queries[0]];
  if(command !== 'nhm' || !nightmare) {
      return;
  };
  
  new ReactionMenu.menu(
    msg.channel,
    msg.author.id,
    [buildEmbed(nightmare)],
    120000,
    {}
  );
  return;
};

module.exports = { getNhm, getNhmName };
