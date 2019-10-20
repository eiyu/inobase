require('dotenv').config()
const { isCommand, isQuery, isWeapon, getResult, destruct } = require('./lib/commands')
const Discord = require('discord.js');
const client = new Discord.Client();
const ReactionMenu = require('discord.js-reaction-menu')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}! bleh`);
});

client.on('message', msg => {
  const { queries } = destruct(msg.content)
  const [type, query_1, query_2] = queries
  console.log(!isWeapon(query_1), !isQuery(query_1), queries.length)
  if (isCommand(msg.content)) {
    const either = isWeapon(query_1) || isQuery(query_1);
    if(queries.length == 2 && (either)) {
      // invalid branch
      msg.channel.send('your query is not valid');
      return;

    }

    // specific branch
    const data = getResult(msg)
    const buildEmbedForItem = (itemData, id) => {
      return new Discord.RichEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')
        .setURL('https://discord.js.org/')
        .setAuthor('Some name', 'https://discord.js.org/', 'https://discord.js.org/')
        .setDescription('Some description here')
        .setThumbnail(`${itemData['picture']}`)
        .addField('Story Skill', `${itemData['story_skill']}`, true)
        .addField('Colosseum Skill', `${itemData['colosseum_skill']}`, true)
        .addField('Aid Skill', `${itemData['aid_skill']}`, true)
        .setFooter('Some footer text here');
    };

    new ReactionMenu.menu(
      msg.channel,
      msg.author.id,
      // -> error prone <-
      data ? data.map((item, id) => buildEmbedForItem(item, id)): false,
      120000,
      // reactions
    );
  };

  return;
});

client.login(process.env.CLIENT_KEY);