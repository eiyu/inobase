require('dotenv').config()
const { isCommand, isQuery, isWeapon, destructQuerySet, emojiHash, emojiInstHash } = require('./commands/lib')
const { getWeapons, getWeaponName } = require('./commands/weapons');
const { getArmors } = require('./commands/armors');
const { getNhm, getNhmName } = require('./commands/nightmares');
const { help } = require('./commands/help');
const { list } = require('./commands/list');
const Discord = require('discord.js');
const client = new Discord.Client();
const getMap = {
  'weaps': getWeapons,
  'armors': getArmors,
  'nhms': getNhm,
  'nhm': getNhmName,
  'weap': getWeaponName
}

const emoji = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const allEmoji = client.emojis.filter(emoji => emoji.name.startsWith('doro'));
  allEmoji.forEach(emoji => {
    emojiInstHash[emoji.name] = emoji;
    emojiHash[emoji.name] = emoji.toString();
  });
});

client.on('message', async msg => {
  const {prefix,command, queries } = destructQuerySet(msg.content);
  const [__type, query_1] = queries;
  if(msg.content == '?dhelp') {
    help(msg);
    return;
  };
  if(msg.content == '?dlist' || msg.content == '?dlist-buff') {
    list(msg);
    return;
  };
  if(prefix == '?' && !isCommand(msg.content)) {
    msg.channel.send(`there is no ${msg.content} command, ?dhelp fro more info`);
    return;
  };
  if(isCommand(msg.content)) {
    const either = isWeapon(query_1) || isQuery(query_1);
    if(queries.length <= 2 && (either)) {
      msg.channel.send('Your query is not valid');
      return;
    };
    getMap[command](msg);
  return;
  };
});

client.login(process.env.CLIENT_KEY);