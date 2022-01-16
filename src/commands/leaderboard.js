/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {DefaultEmbed} from '../constants.js';
import {lb} from '../stats/leaderboard.js';

export default {
  'name': 'leaderboard',
  'description': 'Returns basic infection leaderboards',
  'options': [
    {
      'type': 3,
      'name': 'category',
      'description': 'Leaderboard Category',
      'required': true,
      'choices': [
        {
          name: 'Infected Kills',
          value: 'infectedKills',
        },
        {
          name: 'Survivor Kills (very inaccurate)',
          value: 'survivorKills',
        },
      ],
    },
  ],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    /**
     * @type {string}
     */
    const category = interaction.options.get('category').value;
    const lbData = await lb.getLB();
    const embeds = [];
    const statLb = lbData[category];
    const itemPer = Math.ceil(statLb.length/4);
    // eslint-disable-next-line max-len
    const maxIgnLength = Math.max(...statLb.map((data)=>data.ign.length + (data.guildTag?.length || 0) + data.rank.length + 8));
    let pos = 0;
    for (let i = 0; i < 4; i++) {
      const statsEmbed = new DefaultEmbed(interaction.guild?.me || interaction.client.user);
      const lbRange = statLb.slice(i*itemPer, (i+1)*itemPer);
      statsEmbed.setDescription('');
      statsEmbed.setTitle(`Infections Leaderboard - ${category === 'survivorKills' ? 'Survivor Kills': 'Infected Kills'}`);
      const rowPer = Math.ceil(lbRange.length/5);
      for (let j = 0; j < 5; j++) {
        const displayedLb = lbRange.slice(j*rowPer, (j+1)*rowPer);
        const formatted = displayedLb.map((data)=>{
          pos++;
          return [
            `#${pos}.`.padStart(5, ' '),
            `[${data.rank}] ${data.ign} ${data.guildTag ? `[${data.guildTag}] ` : ''}:`.padEnd(maxIgnLength, ' '),
            `${data[category]};`,
          ].join(' ');
        });
        statsEmbed.addField('\u200B', '```css\n'+formatted.join('\n')+'```');
      };
      embeds.push(statsEmbed);
    }

    await interaction.reply({embeds});
  },
};

