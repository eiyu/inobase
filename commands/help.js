

const help = async (msg) => {
  msg.channel.send(`
**Nightmares Commands**
* \`?nhms <buff> <buff_type>\` - search multiple nightmares with given query
* \`?nhms <elem> <elem_type>\` - search multiple nightmares with given query
* \`?nhm <name>\` - find the nightmare in database

* Buff Type List for Nightmares
- matk/ patk/ mdef/ pdef/ spc/ spr/ hpr/ hit
* Element Type List for Nightmares
- wind/ water/ fire - note that nightmares didn't have element,
  it will search the word of the "element_type" in skills description.

**Weapon Commands**
* \`?weaps <weap_type> <buff> <buff_type> <dc/rb/sb>\` - search only weapon_type by given query
* \`?weaps <weap_type> <buff> <buff_type>\` - search only weapon_type by given query
* \`?weaps <buff> <buff_type>\` - search all weapons by given query
* \`?weaps <elem> <elem_type>\` - search all weapons by given query
* \`?weaps <buff> <elem>\` - search all weapons by given query
* \`?weap <name>\` - find weapon by name

* Weapon Types
- blade/ instrument/ hammer/ ranged/ tome/ polearm/ staff/ focus
* Buff Type List for Weapons
- matk/ patk/ mdef/ pdef
* Elem Type List for Weapons
- wind/ water/ fire 

**Armors Commands**
* \`?armor <armor_type> <buff> <buff_type>\` - search armors by given query
* \`?armor <slay> <slay_type>\` - search armors by given query
* \`?armor <buff> <elem>\` - search armors by given query

* Armor Types
- head/ body/ hands/ feet
* Buff Type List for Armors
- matk/ patk/ mdef/ pdef
* Slayer Type List for Armors
- (enemies race/type) or element type


**Other Commands**
* \`?dhelp\` - print this message
* \`?dlist-buff\` - print detailed buff query list
  `);
};

module.exports = { help };