import {getMaps} from '../API/index.js';
import {statToValue, stats as constantStats, DefaultEmbed} from '../constants.js';
import {formatNumber, formatSnake, formatTime} from '../utils.js';
/**
 * Mapstats but overview
 */

// @TODO : generate graphs
/**
 * Generates embed
 * @param {Interaction} interaction Discord interaction
 * @param {string} formattedIgn Formatted IGN
 * @param {Record<string, any>} stats Stats
 * @param {srting} statColumn Stat column
 * @return {MessageEmbed}
 */
export async function generateEmbed(interaction, formattedIgn, stats, statColumn = 'Kills per game') {
  const mapList = await getMaps();
  const formatType = statColumn.includes('time') ? formatTime : formatNumber;
  const statsPerMap = mapList
      .map((name)=>[
        name,
        statToValue[constantStats.indexOf(statColumn)](stats, name),
      ]).sort((a, b)=>b[1]-a[1])
      .map(([name, val], i)=>`${i+1}. ${formatSnake(name)}: \`${formatType(val)}\` ${statColumn}`);
  const displayFields = [];
  while (statsPerMap.length > 0) {
    displayFields.push({
      name: '\u200B',
      value: statsPerMap.splice(0, 5).join('\n'),
    });
  }
  const statsEmbed = new DefaultEmbed(interaction.guild?.me || interaction.client.username);
  statsEmbed
      .setTitle(`Map overview, stats of ${formattedIgn}`)
      .addFields(displayFields);
  return statsEmbed;
}
