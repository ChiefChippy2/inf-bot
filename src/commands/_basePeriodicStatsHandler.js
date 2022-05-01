/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue} from '../constants.js';
import {getLinkedUserById} from '../link/database.js';
import {getUserStatsByUUID} from '../stats/periodicstats.js';
import {deltaJson, formatIGN, formatNumber, formatTime, monthDays} from '../utils.js';

/**
 * Periodic stats
 * @param {Interaction} interaction Interaction
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 */
export async function periodicStats(interaction, type) {
  const linkedUser = await getLinkedUserById(interaction.user.id);
  if (!linkedUser) {
    return interaction.reply({
      // eslint-disable-next-line max-len
      content: `Your discord account isn't linked to a minecraft account. This is mandatory for periodic stats (daily, weekly, monthly) to prevent storing excessive data.
- Tip: to link your account, do \`/link ign\``,
    });
  };
  const storedStats = await getUserStatsByUUID(linkedUser.get('mcUuid'), type);
  if (!storedStats || !storedStats.get('stats')) {
    return interaction.reply({
      content: 'No stored stats is found. Please try again later (this might be because you linked your account recently).',
    });
  };
  const storedInfStats = JSON.parse(storedStats.get('stats'));
  const currentStats = await getStatsRaw(linkedUser.get('mcUuid'));
  const curInfStats = currentStats?.player.stats.MurderMystery;
  const lastUpdated = linkedUser.get('statsLastUpdated');
  const lastReset = formatTime((Date.now() - lastUpdated) / 1000);
  const nextResetCatalog = {
    'DAILY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24)/1000,
    'WEEKLY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24 * 7)/1000,
    'MONTHLY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24 * monthDays(lastUpdated))/1000, // Different, cuz months may be shorter/longer
  };
  if (!curInfStats || curInfStats.games_MURDER_INFECTION <= storedInfStats.games_MURDER_INFECTION) {
    return interaction.reply({
      content: `You haven't played any games of infections since the last reset... (${lastReset} ago)`,
    });
  }
  const statImprovement = deltaJson(storedInfStats, curInfStats);
  const statCol = statToValue.map((func)=>func(statImprovement, ''));
  const readableType = type.toLowerCase().replace(/./, (x)=>x.toUpperCase());
  const embed = new DefaultEmbed(interaction?.guild.me || interaction.client.user)
      .setTitle(`${readableType} stats of ${formatIGN(currentStats.nickname, currentStats.rank)}`)
      .setDescription(`Last reset : ${lastReset} ago
Next reset in ${formatTime(nextResetCatalog[type])}`)
      .addFields(statCol.map((stat, i)=>({
        name: stats[i],
        value: (stats[i].includes('time') ? formatTime : formatNumber)(stat),
        inline: true,
      })));
  await interaction.reply({
    embeds: [embed],
  });
}
