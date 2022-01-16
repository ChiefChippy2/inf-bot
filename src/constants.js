import {MessageActionRow, MessageEmbed, MessageSelectMenu} from 'discord.js';
import {randUUID} from './utils.js';
import Har from 'hypixel-api-reborn';
const divide = Har.Utils.divide;

/**
 * @typedef {import('discord.js').GuildMember} GuildMember
 * @typedef {import('discord.js').ClientUser} ClientUser
 * @typedef {Object} StatRow
 * @property {MessageActionRow} row
 * @property {string} id
 */
/**
 * @callback StatFunc Stat Function
 * @param {Record<string, number|null>} stats Stats
 * @param {string} [map=''] map
 * @returns {number}
 */

/**
 * Default Embed
 */
export class DefaultEmbed extends MessageEmbed {
  /**
   * Constructor
   * @param {GuildMember|ClientUser} bot Bot
   * @param {...any} args args
   */
  constructor(bot, ...args) {
    super(...args);
    this
        .setColor('GOLD')
        .setTimestamp()
        .setFooter({
          text: `Revealed by your bot, ${bot?.displayName || bot.username} | Stats cached for 2 minutes`,
        })
        .setDescription('If a stat is 0, it can either mean the API doesn\'t provide the value OR the stat is actually 0.');
  }
}

export const stats = [
  'Wins',
  'Losses',
  'Total games',

  'Kills (total)',
  'Bow Kills',
  'Infection Count',

  'Trap Kills',
  'Final Bow Kills',
  'Deaths',

  'WLR',
  'KDR',
  'FKDR',

  'Kills per game',
  'Final Bow Kills per game',
  'Last one alive count',

  'Infection per bow kill',
  'Coins picked up',
  'Coins per game',

  'Total survival time',
  'Longest survival time',
  'Survival time per game',
];
const suffix = '_MURDER_INFECTION';

// eslint-disable-next-line valid-jsdoc
/**
 * @type {StatFunc[]}
 */
export const statToValue = [
  (stats, map = '') => stats['wins'+map+suffix] || 0,
  (stats, map = '') => stats['games'+map+suffix] - stats['wins'+map+suffix] || 0,
  (stats, map = '') => stats['games'+map+suffix] || 0,

  // Total kills : Infected + Survivor
  (stats, map = '') => stats['kills_as_infected'+map+suffix] + stats['kills_as_survivor'+map+suffix] || 0,
  (stats, map = '') => stats['kills_as_survivor'+map+suffix] || 0,
  (stats, map = '') => stats['kills_as_infected'+map+suffix] || 0,

  (stats, map = '') => stats['trap_kills'+map+suffix] || 0,
  (stats, map = '') => stats['bow_kills'+map+suffix] || 0,
  (stats, map = '') => stats['deaths'+map+suffix] || 0,

  (stats, map = '') => divide(
      stats['wins'+map+suffix] || 0,
      stats['games'+map+suffix] - stats['wins'+map+suffix] || 0,
  ),
  (stats, map = '') => divide(
      stats['kills_as_infected'+map+suffix] + stats['kills_as_survivor'+map+suffix] || 0,
      stats['deaths'+map+suffix] || 0,
  ),
  (stats, map = '') => divide(
      stats['bow_kills'+map+suffix] || 0,
      stats['deaths'+map+suffix] || 0,
  ),

  (stats, map = '') => divide(
      stats['kills_as_infected'+map+suffix] + stats['kills_as_survivor'+map+suffix] || 0,
      stats['games'+map+suffix] || 0,
  ),
  (stats, map = '') => divide(
      stats['bow_kills'+map+suffix] || 0,
      stats['games'+map+suffix] || 0,
  ),
  (stats, map = '') => stats['last_one_alive'+map+suffix] || 0,

  (stats, map = '') => divide(
      stats['kills_as_infected'+map+suffix] || 0,
      stats['kills_as_survivor'+map+suffix] || 0,
  ),
  (stats, map = '') => stats['coins_pickedup'+map+suffix] || 0,
  (stats, map = '') => divide(
      stats['coins_pickedup'+map+suffix] || 0,
      stats['games'+map+suffix] || 0,
  ),

  (stats, map = '') => Math.round(divide(stats['total_time_survived_seconds'+map+suffix] || 0, stats['games'+suffix] || 0)) * (stats['games'+map+suffix] || 0),
  (stats, map = '') => stats['longest_time_as_survivor_seconds'+map+suffix] || 0,
  (stats, map = '') => Math.round(divide(stats['total_time_survived_seconds'+map+suffix] || 0, stats['games'+suffix] || 0)),
];

/**
 * Gets Stat Func
 * @param {string} name Name of stat
 * @return {StatFunc|null}
 */
export const getStatFunc = (name) => statToValue[stats.indexOf(name)];

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
