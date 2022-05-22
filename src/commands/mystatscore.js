/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {DefaultEmbed, scoreMultiplier, readable} from '../constants.js';
import {formatIGN, formatNumber} from '../utils.js';
import {calcScore} from '../stats/score.js';
import {getPeriodicStatsDelta} from './_basePeriodicStatsHandler.js';
import {getLinkedUserById} from '../link/database.js';
import {getStatsRaw} from '../API/index.js';

export default {
  'name': 'mystatscore',
  'description': '[BETA] Returns your own stats score',
  'options': [
    {
      'type': 3,
      'name': 'type',
      'description': 'Type of stat to use for score',
      'choices': [
        {
          'name': 'Daily',
          'value': 'DAILY',
        },
        {
          'name': 'Weekly',
          'value': 'WEEKLY',
        },
        {
          'name': 'Monthly',
          'value': 'MONTHLY',
        },
        {
          'name': 'All-time',
          'value': 'all',
        },
      ],
      'required': true,
    },
  ],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    // Code here...
    const statChoice = interaction.options.get('type').value;
    const linkedUser = await getLinkedUserById(interaction.user.id);
    if (!linkedUser) {
      return interaction.reply({
      // eslint-disable-next-line max-len
        content: `Your discord account isn't linked to a minecraft account. This is mandatory for periodic stats (daily, weekly, monthly) to prevent storing excessive data.
- Tip: to link your account, do \`/link ign\``,
      });
    };
    let scoreData;
    let curStats;
    if (statChoice === 'all') {
      const allTimeStats = await getStatsRaw(linkedUser.get('mcUuid'));
      scoreData = calcScore(allTimeStats?.player.stats.MurderMystery || {}, '') || {};
      curStats = allTimeStats;
    } else {
      const perStats = await getPeriodicStatsDelta(linkedUser, statChoice);
      if (perStats.error) {
        if (perStats.code === 1) return await interaction.reply({content: 'Play some games so we can see how well you are doing!'});
        else return await interaction.reply({content: 'We don\'t have any records of your stats in our database, try again later.'});
      }
      const {statImprovement, currentStats} = perStats;
      scoreData = calcScore(statImprovement, '', scoreMultiplier[statChoice]);
      curStats = currentStats;
    }
    await interaction.reply({
      embeds: [
        new DefaultEmbed(interaction.guild?.me || interaction.client.user)
            .setDescription('This is a score based on both skill and grind. **Please note that the periodic score might need adjustments.**')
            .setTitle(`Score of ${formatIGN(curStats.nickname, curStats.rank)}'s ${readable[statChoice]} stats`)
            .addField('Skill Score - based on ratios', `${formatNumber(scoreData.skillScore)} (x${formatNumber(scoreData.multipliers)})`)
            .addField('Grind Score - based on playtime', formatNumber(scoreData.grindScore))
            .addField('Final Score', formatNumber(scoreData.finalScore))
            .addField('Confidence Level of Score (0 to 10)', formatNumber(scoreData.confidenceLevel)),
      ],
    });
  },
};

