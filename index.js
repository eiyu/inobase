require('dotenv').config()
const weapons = require('./lib/weapons')
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('警鐘ハ散華ノ火花ヲ呼ブ(壱), 警鐘ハ散華ノ火花ヲ呼ブ(弐)')
  console.log(`Logged in as ${client.user.tag}! bleh`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login(process.env.CLIENT_KEY);