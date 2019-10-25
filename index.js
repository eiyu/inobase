require('dotenv').config()
const { isCommand, isQuery, isWeapon, getWeapons, getArmors, destruct } = require('./commands/commands')
const Discord = require('discord.js');
const client = new Discord.Client();
const ReactionMenu = require('discord.js-reaction-menu')
const getMap = {
  'weapons': getWeapons,
  'armors': getArmors
}
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! bleh`);
});

client.on('message', async msg => {
  const {prefix,command, queries } = destruct(msg.content);
  const [type, query_1, query_2] = queries;
  const data = await getMap[command](msg);
  if(prefix && !isCommand(msg.content)) {
    msg.reply("there is no such command try");
    return;
  }
  if(isCommand(msg.content)) {
    const either = isWeapon(query_1) || isQuery(query_1);
    if(queries.length <= 2 && (either)) {
      msg.channel.send('Your query is not valid');
      return;
    };
  if(data[0].hasOwnProperty('err')) {
    msg.channel.send(`Sorry I can't find it or, ${data[0]['err']}`);
  };
  // if()

  // specific branch
  const buildEmbedForItem = (itemData, id) => {
    return new Discord.RichEmbed()
      .setColor('#0099ff')
      .setTitle(`${itemData['name']}`)
      .setURL(`${itemData['url']}`)
      .setDescription('Under Development! the data might not fully covered')
      .setThumbnail(`${itemData['picture']}`)
      .addField('Colosseum Skill', `${itemData['colosseum_skill']}`, true)
      .addField('Aid Skill', `${itemData['col_aid_skill']}`, true)
      .addField('Stats', `PATK: ${itemData['atk']} \n MATK: ${itemData['matk']} \n PDEF: ${itemData['def']} \n MDEF: ${itemData['mdef']} \n` , true)
      .setFooter('Some footer text here');
    };

  new ReactionMenu.menu(
    msg.channel,
    msg.author.id,
    data ? data.map((item, id) => buildEmbedForItem(item, id)): false,
    120000,
    // reactions
    );
  };

  return;
});

client.login(process.env.CLIENT_KEY);