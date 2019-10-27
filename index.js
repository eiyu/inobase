require('dotenv').config()
const { isCommand, isQuery, isWeapon, destruct } = require('./commands/lib')
const { getWeapons } = require('./commands/weapons');
const { getArmors } = require('./commands/armors');
const { getNhm, getNhmName } = require('./commands/nightmares');
const { help } = require('./commands/help');
const Discord = require('discord.js');
const client = new Discord.Client();
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
  const [__type, query_1] = queries;
  // const data = await 
  if(msg.content == '?dhelp') {
    help(msg);
    return;
  };
  if(prefix == '?' && !isCommand(msg.content)) {
    msg.channel.send(`there is no ${command} command, ?help fro more info`);
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