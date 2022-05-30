/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 * @typedef {import('../database/index.js').UserStats} UserStats
 * @typedef {import('../database/index.js').LinkedUser} LinkedUser
 */
/**
 * @typedef {Object} NoUserStats
 * @property {boolean} error True if error
 * @property {string} reason Reason for error in human readable enum string
 * @property {number} code Code. 0: No stored stats; 1: No new games played
 */
/**
 * @typedef {Object} ParsedUserStats
 * @property {boolean} error False if no error ...
 * @property {UserStats} databaseData Database data
 * @property {Record<string, any>} currentStats
 * @property {Record<string, number>} statImprovement parsed delta
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue} from '../constants.js';
import {getLinkedUserById} from '../link/database.js';
import {getUserStatsByUUID} from '../stats/periodicstats.js';
import {deltaJson, formatIGN, formatNumber, formatTime, monthDays} from '../utils.js';

/**
 * Get periodic stats of a linked user
 * @param {LinkedUser} linkedUser User ID
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 * @private
 * @return {UserStats|null} Null if no stats
 */
export async function getPeriodicStats(linkedUser, type) {
  const storedStats = await getUserStatsByUUID(linkedUser.get('mcUuid'), type);
  if (!storedStats || !storedStats.get('stats')) return null;
  return storedStats;
}

/**
 * Get delta'ed periodic stats of a linked user
 * @param {LinkedUser} linkedUser User ID
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 * @return {ParsedUserStats|NoUserStats} No user stats if no stats
 */
export async function getPeriodicStatsDelta(linkedUser, type) {
  const storedInfStats = await getPeriodicStats(linkedUser, type);
  if (!storedInfStats) {
    return {
      'error': true,
      'reason': 'STORED_STATS_MISSING',
      'code': 0,
    };
  };
  const apiLikeStoredInfStats = JSON.parse(storedInfStats.get('stats'));
  const currentStats = await getStatsRaw(linkedUser.get('mcUuid'));
  const curInfStats = currentStats?.player.stats.MurderMystery;
  if (!curInfStats || curInfStats.games_MURDER_INFECTION <= apiLikeStoredInfStats.games_MURDER_INFECTION) {
    return {
      'error': true,
      'reason': 'NO_GAMES_PLAYED',
      'code': 1,
    };
  }
  const statImprovement = deltaJson(apiLikeStoredInfStats, curInfStats);
  return {
    error: false,
    databaseData: storedInfStats,
    statImprovement,
    currentStats,
  };
}

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
  const storedStats = await getPeriodicStatsDelta(linkedUser, type);
  if (storedStats.error) {
    if (storedStats.code === 0) {
      return interaction.reply({
        content: 'No stored stats is found. Please try again later (this might be because you linked your account recently).',
      });
    }

    if (storedStats.code === 1) {
      return interaction.reply({
        content: `You haven't played any games of infections since the last reset... (${lastReset} ago)`,
      });
    };
  }
  const {databaseData, statImprovement, currentStats} = storedStats;
  const lastUpdated = databaseData.get('storeTime');
  const lastReset = formatTime((Date.now() - lastUpdated) / 1000);
  const nextResetCatalog = {
    'DAILY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24)/1000,
    'WEEKLY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24 * 7)/1000,
    'MONTHLY': (lastUpdated - Date.now() + 1000 * 60 * 60 * 24 * monthDays(lastUpdated))/1000, // Different, cuz months may be shorter/longer
  };
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
