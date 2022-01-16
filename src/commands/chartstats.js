/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getMaps, getStatsRaw} from '../API/index.js';
import {statToValue, stats as statCol, DefaultEmbed} from '../constants.js';
import {formatSnake} from '../utils.js';

export default {
  'name': 'chartstats',
  'description': 'Map stats but in a chart',
  'options': [
    {
      'type': 3,
      'name': 'ign',
      'description': 'Player\'s IGN',
      'required': true,
    },
    {
      'type': 3,
      'name': 'criterion',
      'description': 'Criterion to show (for sanity reasons, it is impossible to show all of them at once)',
      'required': true,
    },
    {
      'type': 3,
      'name': 'ign2',
      'description': '2nd Player\'s IGN',
      'required': false,
    },
  ],
  'dynamic': true,
  'deploy': async (curObj) =>{
    delete curObj.dynamic;
    delete curObj.deploy;
    curObj.options[1].choices = statCol.map((x)=>({
      name: x,
      value: x,
    }));
    return curObj;
  },
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    const ign = interaction.options.get('ign').value;
    const crit = interaction.options.get('criterion').value;
    const ign2 = interaction.options.get('ign2')?.value;
    const stats = await getStatsRaw(ign);
    const formattedIgn = stats.player.displayname;
    const params = new URLSearchParams();
    const statFunc = statToValue[statCol.indexOf(crit)];
    const maps = await getMaps();
    const mapStats = maps.map((map)=>statFunc(stats.player.stats.MurderMystery, '_'+map));
    params.append('cht', 'r'); // Radar chart
    params.append('chtt', `${crit}`); // Title
    params.append('chts', `1FADED,28`); // Title Styling
    params.append('chxt', 'x,r'); // Axes
    params.append('chs', 520); // Size
    params.append('chdl', `${formattedIgn}`); // Label
    params.append('chdlp', 'b'); // Label position : bottom
    params.append('chf', 'bg,s,000000ff'); // BG Transparent
    params.append('chco', 'FF0000'); // Line RED
    const maxVal = Math.max(...mapStats);
    params.append('chxr', `1,0,${maxVal},${maxVal > 10 ? Math.round(maxVal / 10) : maxVal / 10}`); // Defining axes : 1, start, end, step. Start = 0, End = max
    const mapStatsPercent = mapStats.map((num)=>num * 100 / maxVal);
    params.append('chd', `t:${mapStatsPercent.join(',')},${mapStatsPercent[0]}`);
    params.append('chxl', `0:|${maps.map(formatSnake).join('|')}`);
    if (ign2) {
      const p2stats = await getStatsRaw(ign2);
      const p2Ign = p2stats.player.displayname;
      const p2mapStats = maps.map((map)=>statFunc(p2stats.player.stats.MurderMystery, '_'+map));
      const finalMaxVal = Math.max(...p2mapStats, maxVal);
      const mapStatsPercent1 = mapStats.map((num)=>num * 100 / finalMaxVal);
      mapStatsPercent1.push(mapStatsPercent1[0]);
      const mapStatsPercent2 = p2mapStats.map((num)=>num * 100 / finalMaxVal);
      mapStatsPercent2.push(mapStatsPercent2[0]);
      params.set('chxr', `1,0,${finalMaxVal},${finalMaxVal > 10 ? Math.round(finalMaxVal / 10) : finalMaxVal / 10}`);
      params.set('chd', `t:${mapStatsPercent1.join(',')}|${mapStatsPercent2.join(',')}`);
      params.set('chco', 'FF0000,00FF00'); // Line RED and GREEN
      params.set('chdl', `${formattedIgn}|${p2Ign}`);
    }

    const embed = new DefaultEmbed(interaction.guild?.me || interaction.client.user)
        .setImage(`https://chart.googleapis.com/chart?${params}`);
    interaction.reply({
      embeds: [embed],
    });
  },
};
