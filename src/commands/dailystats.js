/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue} from '../constants.js';
import {formatTime, formatNumber, formatIGN, deltaJson} from '../utils.js';
import {getLinkedUserById} from '../link/database.js';
import {getUserStatsByUUID} from '../stats/dailystats.js';

export default {
  'name': 'dailystats',
  'description': 'Shows your daily stats (only for LINKED users)!',
  'options': [],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    const linkedUser = await getLinkedUserById(interaction.user.id);
    if (!linkedUser) {
      return interaction.reply({
        // eslint-disable-next-line max-len
        content: `Your discord account isn't linked to a minecraft account. This is mandatory for daily stats to prevent storing excessive data.`,
      });
    };
    const storedStats = await getUserStatsByUUID(linkedUser.get('mcUuid'));
    if (!storedStats || !storedStats.get('stats')) {
      return interaction.reply({
        content: 'No stored stats is found. Please try again later (this might be because you linked your account recently).',
      });
    };
    const storedInfStats = JSON.parse(storedStats.get('stats'));
    const currentStats = await getStatsRaw(linkedUser.get('mcUuid'));
    const curInfStats = currentStats?.player.stats.MurderMystery;
    if (!curInfStats || curInfStats.games_MURDER_INFECTION <= storedInfStats.games_MURDER_INFECTION) {
      return interaction.reply({
        content: `You haven't played any games of infections since the last reset... (${formatTime((Date.now() - linkedUser.get('statsLastUpdated')) / 1000)} ago)`,
      });
    }
    const statImprovement = deltaJson(storedInfStats, curInfStats);
    const statCol = statToValue.map((func)=>func(statImprovement, ''));
    const embed = new DefaultEmbed(interaction?.guild.me || interaction.client.user)
        .setTitle(`Daily stats of ${formatIGN(currentStats.nickname, currentStats.rank)}`)
        .setDescription(`Last reset : ${formatTime((Date.now() - linkedUser.get('statsLastUpdated'))/1000)} ago
Next reset in ${formatTime((linkedUser.get('statsLastUpdated') - Date.now() + 1000 * 60 * 60 * 24)/1000)}`)
        .addFields(statCol.map((stat, i)=>({
          name: stats[i],
          value: (stats[i].includes('time') ? formatTime : formatNumber)(stat),
          inline: true,
        })));
    await interaction.reply({
      embeds: [embed],
    });
  },
};

