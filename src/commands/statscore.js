/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStats, getStatsRaw} from '../API/index.js';
import {DefaultEmbed} from '../constants.js';
import {formatNumber} from '../utils.js';
import {calcScore} from '../stats/score.js';

export default {
  'name': 'statscore',
  'description': 'Returns score calculated from infection stats',
  'options': [
    {
      'type': 3,
      'name': 'ign',
      'description': 'IGN (or uuid)',
      'required': true,
    },
  ],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    // Code here...
    const ign = interaction.options.get('ign').value;
    const allStats = await getStats(ign);
    const rawStats = await getStatsRaw(ign);
    const formattedIgn = `[${allStats.rank}] ${allStats.nickname}`;
    const rstats = rawStats?.player.stats.MurderMystery || {};

    const scoreData = calcScore(rstats, '');
    await interaction.reply({
      embeds: [
        new DefaultEmbed(interaction.guild?.me || interaction.client.user)
            .setDescription('This is a score based on both skill and grind.')
            .setTitle(`Score of ${formattedIgn}'s stats`)
            .addField('Skill Score - based on ratios', `${formatNumber(scoreData.skillScore)} (x${formatNumber(scoreData.multipliers)})`)
            .addField('Grind Score - based on playtime', formatNumber(scoreData.grindScore))
            .addField('Final Score', formatNumber(scoreData.finalScore))
            .addField('Confidence Level of Score (0 to 10)', formatNumber(scoreData.confidenceLevel)),
      ],
    });
  },
};

