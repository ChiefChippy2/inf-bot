import {MessageActionRow, MessageEmbed, MessageSelectMenu} from 'discord.js';
import {randUUID} from './utils.js';
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
  'Deaths',
  'Trap Kills',
  'Trap Kills per 1k games',
  'KDR',
  'WLR',
  'Kills per game',
  'Infection per bow kill',
  'Coins picked up',
  'Coins per game',
  'Total survival time',
  'Longest survival time',
  'Survival time per game',
];
const suffix = '_MURDER_INFECTION';
export const statToValue = [
  (stats, map) => stats['wins_'+map+suffix] || 0,
  (stats, map) => stats['games_'+map+suffix] - stats['wins_'+map+suffix] || 0,
  (stats, map) => stats['games_'+map+suffix] || 0,
  (stats, map) => stats['kills_as_infected_'+map+suffix] + stats['kills_'+map+suffix] || 0,
  (stats, map) => stats['kills_as_survivor_'+map+suffix] || 0,
  (stats, map) => stats['kills_as_infected_'+map+suffix] || 0,
  (stats, map) => stats['deaths_'+map+suffix] || 0,
  (stats, map) => stats['trap_kills_'+map+suffix] || 0,
  (stats, map) => divide((stats['trap_kills_'+map+suffix] || 0) * 1e3, stats['games_'+map+suffix] || 0),
  (stats, map) => divide(
      stats['kills_as_infected_'+map+suffix] + stats['kills_as_survivor_'+map+suffix] + stats['kills_'+map+suffix] || 0,
      stats['deaths_'+map+suffix] || 0,
  ),
  (stats, map) => divide(
      stats['wins_'+map+suffix] || 0,
      stats['games_'+map+suffix] - stats['wins_'+map+suffix] || 0,
  ),
  (stats, map) => divide(
      stats['kills_as_infected_'+map+suffix] + stats['kills_'+map+suffix] || 0,
      stats['games_'+map+suffix] || 0,
  ),
  (stats, map) => divide(
      stats['kills_as_infected_'+map+suffix] || 0,
      stats['kills_as_survivor_'+map+suffix] || 0,
  ),
  (stats, map) => stats['coins_pickedup_'+map+suffix] || 0,
  (stats, map) => divide(
      stats['coins_pickedup_'+map+suffix] || 0,
      stats['games_'+map+suffix] || 0,
  ),
  (stats, map) => Math.round(divide(stats['total_time_survived_seconds_'+map+suffix] || 0, stats['games'+suffix] || 0)) * (stats['games_'+map+suffix] || 0),
  (stats, map) => stats['longest_time_as_survivor_seconds_'+map+suffix] || 0,
  (stats, map) => Math.round(divide(stats['total_time_survived_seconds_'+map+suffix] || 0, stats['games'+suffix] || 0)),
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
