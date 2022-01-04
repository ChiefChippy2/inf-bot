import {MessageActionRow, MessageEmbed, MessageSelectMenu} from 'discord.js';
import {randUUID} from './utils.js';

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
