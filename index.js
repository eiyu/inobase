require('dotenv').config()
const { isCommand, isQuery, isWeapon, destruct } = require('./commands/lib')
const { getWeapons } = require('./commands/weapons');
const { getArmors } = require('./commands/armors');
const { getNhm, getNhmName } = require('./commands/nightmares');
const Discord = require('discord.js');
const client = new Discord.Client();
const ReactionMenu = require('discord.js-reaction-menu')
const getMap = {
  'weapons': getWeapons,
  'armors': getArmors,
  'nhms': getNhm,
  'nhm': getNhmName,
}
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! bleh`);
});

client.on('message', async msg => {
  const {prefix,command, queries } = destruct(msg.content);
  const [type, query_1, query_2] = queries;
  // const data = await 
  if(prefix == '?' && !isCommand(msg.content)) {
    msg.channel.send(`there is no ${command} command, ?help fro more info`);
    return;
  }
  if(isCommand(msg.content)) {
    const either = isWeapon(query_1) || isQuery(query_1);
    if(queries.length <= 2 && (either)) {
      msg.channel.send('Your query is not valid');
      return;
    };
    getMap[command](msg);
  // if(data[0].hasOwnProperty('err')) {
  //   msg.channel.send(`Sorry I can't find it or, ${data[0]['err']}`);
  // };

  // this shouldn't be here, under development
  // const buildEmbedForItem = (itemData, id) => {
  //   const embed =  new Discord.RichEmbed();
  //     // weapon
  //     if (itemData.hasOwnProperty('element')) {
  //       embed
  //       .setColor('#0099ff')
  //       .setTitle(`${itemData['name']}`)
  //       .setURL(`${itemData['url']}`)
  //       .setDescription(`Element: ${itemData['element']}`)
  //       .setThumbnail(`${itemData['picture']}`)
  //       .addField('Colosseum Skill', `${itemData['colosseum_skill']}`, true)
  //       .addField('Aid Skill', `${itemData['col_aid_skill']}`, true)
  //       .addField('Stats', `PATK: ${itemData['patk']} \n MATK: ${itemData['matk']} \n PDEF: ${itemData['pdef']} \n MDEF: ${itemData['mdef']} \n` , true)
  //       .setFooter('Some footer text here');
  //     }
  //     // armor
  //     if (itemData.hasOwnProperty('weapon_type')) {
  //       embed
  //       .setColor('#0099ff')
  //       .setTitle(`${itemData['name']}`)
  //       .setURL(`${itemData['url']}`)
  //       .setDescription(`Weapon Type: ${itemData['weapon_type']}`)
  //       .setThumbnail(`${itemData['picture']}`)
  //       .addField('Skill 1', `${itemData['colosseum_skill']}`, true)
  //       .addField('Skill 2', `${itemData['col_aid_skill']}`, true)
  //       .addField('Stats', `PDEF: ${itemData['pdef']} \n MDEF: ${itemData['mdef']} \n` , true)
  //       .setFooter('Some footer text here');
  //     }
  //     // armor
  //     if (itemData.hasOwnProperty('l_matk')) {
  //       embed
  //       .setColor('#0099ff')
  //       .setTitle(`${itemData['name']}`)
  //       .setURL(`${itemData['url']}`)
  //       // .setDescription(`Weapon Type: ${itemData['weapon_type']}`)
  //       .setThumbnail(`${itemData['picture']}`)
  //       .addField('Skill 1', `${itemData['colosseum_skill']}`, true)
  //       .addField('Skill 2', `${itemData['col_aid_skill']}`, true)
  //       .addField('Stats', `PATK: ${itemData['patk']} \n MATK: ${itemData['matk']} \n PDEF: ${itemData['pdef']} \n MDEF: ${itemData['mdef']} \n` , true)
  //       .setFooter('Some footer text here');
  //     }
  //     return embed;
  // };

  // new ReactionMenu.menu(
  //   msg.channel,
  //   msg.author.id,
  //   data ? data.map((item, id) => buildEmbedForItem(item, id)): false,
  //   120000,
  //   // reactions
  //   );
  // };

  return;
  };
});

client.login(process.env.CLIENT_KEY);