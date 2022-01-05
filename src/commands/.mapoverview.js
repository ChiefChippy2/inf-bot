import {getMaps} from '../API/index.js';
import { statToValue, stats as constantStats, DefaultEmbed } from '../constants.js';
import { formatSnake } from '../utils.js';
/**
 * Mapstats but overview
 */

// @TODO : generate graphs

export async function generateEmbed(interaction, formattedIgn, stats, statColumn = 'Kills per game') {
  const mapList = await getMaps();
      const statsPerMap = mapList.map((name)=>[
        name,
        statToValue[constantStats.indexOf(statColumn)](stats, name),
      ]).sort((a, b)=>b[1]-a[1]).map(([name, val], i)=>`${i+1}. ${formatSnake(name)}: \`${val}\` ${statColumn}`); // @TODO : fix sorting
      const displayFields = [];
      while (statsPerMap.length > 0) {
        displayFields.push({
          name: '\u200B', 
          value: statsPerMap.splice(0, 5).join('\n'),
        });
      }
      const statsEmbed = new DefaultEmbed(interaction.guild.me);
      statsEmbed
          .setTitle(`Map overview, stats of ${formattedIgn}`)
          .addFields(displayFields);
  return statsEmbed;
}
