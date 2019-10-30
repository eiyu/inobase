

const list = async (msg) => {
  msg.channel.send(`
**Buff List**
* \`matk\`  Increase magical attack
* \`patk\`  Increase physical attack
* \`mdef\`  Increase magical defense
* \`pdef\`  Increase physical defense
* \`patk+matk\`  Increase physical attack & magical attack
* \`pdef+mdef\`  Increase physical defense & magical defense
* \`patk+pdef\`  Increase physical attack & physical defense
* \`matk+mdef\`  Increase magical attack & magical defense

**Debuff List**
* \`matk-\`  Reduce magical attack
* \`patk-\`  Reduce physical attack
* \`mdef-\`  Reduce magical defense
* \`pdef-\`  Reduce physical defense
* \`patk-mdef\`  Reduce physical attack & magical defense
* \`matk-pdef\`  Reduce magical attack & physical defense
* \`patk-pdef\`  Reduce physical attack & physical defense
* \`matk-mdef\`  Reduce magical attack & magical defense

  `);
};

module.exports = { list };