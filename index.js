require('dotenv').config()
const { isCommand, getCommand, getQueries } = require('./lib/commands')
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! bleh`);
});

client.on('message', msg => {
  if (isCommand(msg.content)) {
    console.log('woot',getQueries(msg.content).length, getQueries(msg.content)[0]);
    const data = getQueries(msg.content)
    const buildEmbedForItem = (itemData) => {
      return new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setAuthor('Some name', 'https://discord.js.org/', 'https://discord.js.org/')
        .setDescription('Some description here')
        .setThumbnail(`${itemData[1]['picture']}`)
        .addField('Story Skill', `${itemData[0]['story_skill']}`, true)
        .addField('Colosseum Skill', `${itemData[0]['colosseum_skill']}`, true)
        .addField('Aid Skill', `${itemData[0]['aid_skill']}`, true)
        .setFooter('Some footer text here');
    };

    return msg.channel.send(buildEmbedForItem(data));
  };
  return;
});

client.login(process.env.CLIENT_KEY);