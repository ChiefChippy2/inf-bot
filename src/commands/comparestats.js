/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue, ratioOnlyStats} from '../constants.js';
import {formatTime, formatNumber, zip, formatIGN, fixTime} from '../utils.js';

export default {
  'name': 'statcompare',
  'description': 'Compares stats of 2 players',
  'options': [
    {
      'type': 3,
      'name': 'ign1',
      'description': 'IGN (or uuid) of player 1',
      'required': true,
    },
    {
      'type': 3,
      'name': 'ign2',
      'description': 'IGN (or uuid) of player 2',
      'required': true,
    },
    {
      'type': 5,
      'name': 'ratio-only',
      'description': 'Only compare stats that are ratios and not based on play time (NO by default).',
    },
  ],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    const ign = interaction.options.get('ign1').value;
    const ign2 = interaction.options.get('ign2').value;
    const ratio = interaction.options.get('ratio-only')?.value || false;
    if (ign === ign2) return await interaction.reply('The IGNs should be different');
    const [stats1, stats2] = await Promise.all([getStatsRaw(ign), getStatsRaw(ign2)]);
    const rStats1 = stats1?.player.stats.MurderMystery;
    const rStats2 = stats2?.player.stats.MurderMystery;
    if (!rStats1 || !rStats2) return await interaction.reply('One or more players don\'t have infection stats.');
    // eslint-disable-next-line max-len
    rStats1.total_time_survived_seconds_MURDER_INFECTION = fixTime(rStats1.total_time_survived_seconds_MURDER_INFECTION, rStats1).value ?? rStats1.total_time_survived_seconds_MURDER_INFECTION;
    // eslint-disable-next-line max-len
    rStats2.total_time_survived_seconds_MURDER_INFECTION = fixTime(rStats2.total_time_survived_seconds_MURDER_INFECTION, rStats2).value ?? rStats2.total_time_survived_seconds_MURDER_INFECTION;
    // if ratio, filter columns
    let finalStatConverters = statToValue;
    if (ratio) {
      finalStatConverters = statToValue.filter((_, i)=>ratioOnlyStats.includes(i));
    }
    const statCol1 = finalStatConverters.map((func)=>func(rStats1, ''));
    const statCol2 = finalStatConverters.map((func)=>func(rStats2, ''));
    const zippedCol = zip(statCol1, statCol2);
    const winnerArr = zippedCol.reduce((pV, cV)=>{
      pV[cV[1] > cV[0] ? 1 : 0] += 1;
      return pV;
    }, [0, 0]);
    let winner = '';
    if (winnerArr[0] > winnerArr[1]) winner = formatIGN(stats1.nickname, stats1.rank);
    else if (winnerArr[0] < winnerArr[1]) winner = formatIGN(stats2.nickname, stats2.rank);
    else winner = '**IT\'S A TIE!**';
    const embed = new DefaultEmbed(interaction.guild?.me || interaction.client.user)
        .addField('Players compared : ', `${formatIGN(stats1.nickname, stats1.rank)} vs ${formatIGN(stats2.nickname, stats2.rank)}`)
        .addFields(zippedCol.map(([stat1, stat2], i)=>{
          const label = ratio ? stats[ratioOnlyStats[i]] : stats[i];
          if (label.includes('time')) {
            // Approximate time to make it shorter
            let t1 = formatTime(stat1).replace(/^((?:\S+ ){3}\S+).+$/, '$1'); // replaces 2nd word and +
            let t2 = formatTime(stat2).replace(/^((?:\S+ ){3}\S+).+$/, '$1'); // replaces 2nd word and +
            if (stat1 > stat2) t1 = `**${t1}**`;
            else if (stat1 < stat2) t2 = `**${t2}**`;
            return {
              name: label,
              value: `${t1} vs ${t2} (approx. time)`,
              inline: true,
            };
          }
          let t1 = formatNumber(stat1);
          let t2 = formatNumber(stat2);
          if (stat1 > stat2) t1 = `**${t1}**`;
          else if (stat1 < stat2) t2 = `**${t2}**`;
          return {
            name: label,
            value: `${t1} vs ${t2}`,
            inline: true,
          };
        }))
        .addField('Winner (based on most categories) : ', winner);
    await interaction.reply({
      embeds: [embed],
    });
  },
};

