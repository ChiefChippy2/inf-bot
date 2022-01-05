import {MessageActionRow, MessageEmbed, MessageSelectMenu} from 'discord.js';
import {formatTime, formatNumber, randUUID} from './utils.js';
import Har from 'hypixel-api-reborn';
const divide = Har.Utils.divide;

/**
 * @typedef {import('discord.js').GuildMember} GuildMember
 * @typedef {Object} StatRow
 * @property {MessageActionRow} row
 * @property {string} id
 */

/**
 * Default Embed
 */
export class DefaultEmbed extends MessageEmbed {
  /**
   * Constructor
   * @param {GuildMember} bot Bot
   * @param {...any} args args
   */
  constructor(bot, ...args) {
    super(...args);
    this
        .setColor('GOLD')
        .setTimestamp()
        .setFooter({
          text: `Revealed by your bot, ${bot.displayName} | Stats cached for 2 minutes`,
        });
  }
}

export const stats = [
  'Wins',
  'Losses',
  'Total games',
  'Kills (total)',
  'Bow Kills',
  'Infection Count',
  'Death',
  'KDR',
  'WLR',
  'Kills per game',
  'Longest survival time',
  'Total survival time',
  'Survival time per game',
];
const suffix = '_MURDER_INFECTION';
export const statToValue = [
  (stats, map) => formatNumber(stats['wins_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['games_'+map+suffix] - stats['wins_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['games_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['kills_as_infected_'+map+suffix] + stats['kills_as_survivor_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['kills_as_survivor_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['kills_as_infected_'+map+suffix] || 0),
  (stats, map) => formatNumber(stats['deaths_'+map+suffix] || 0),
  (stats, map) => formatNumber(divide(
      stats['kills_as_infected_'+map+suffix] + stats['kills_as_survivor_'+map+suffix] || 0,
      stats['deaths_'+map+suffix] || 0,
  )),
  (stats, map) => formatNumber(divide(
      stats['wins_'+map+suffix] || 0,
      stats['games_'+map+suffix] - stats['wins_'+map+suffix] || 0,
  )),
  (stats, map) => formatNumber(divide(
      stats['kills_as_infected_'+map+suffix] + stats['kills_as_survivor_'+map+suffix] || 0,
      stats['games_'+map+suffix] || 0,
  )),
  (stats, map) => formatTime(stats['longest_time_as_survivor_seconds_'+map+suffix] || 0),
  (stats, map) => formatTime(stats['total_time_survived_seconds_'+map+suffix] || 0),
  (stats, map) => formatTime(divide(stats['total_time_survived_seconds_'+map+suffix]) || 0, stats['games_'+map+suffix] || 0),
];

const selMenu = new MessageSelectMenu();
/**
 * Generates stat selection row
 * @param {string} [id] ID
 * @return {StatRow}
 */
export function statSelectionRow(id = randUUID()) {
  const row = new MessageActionRow().addComponents([
    selMenu
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder('Select a stat')
        .setOptions(stats.map((opt)=>({
          label: opt,
          value: opt,
        })))
        .setCustomId(id),
  ]);
  return {row, id};
}
