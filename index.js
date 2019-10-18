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
    return;
  };
  return;
});

client.login(process.env.CLIENT_KEY);