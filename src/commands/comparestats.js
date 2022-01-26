/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue} from '../constants.js';
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
  ],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    const ign = interaction.options.get('ign1').value;
    const ign2 = interaction.options.get('ign2').value;
    if (ign === ign2) return await ineraction.reply('The IGNs should be different');
    const [stat1, stat2] = await Promise.all([getStatsRaw(ign), getStatsRaw(ign2)]);
    const statCol1 = statToValue.map((func)=>func(stat1?.player.stats.MurderMystery, ''));
    const statCol2 = statToValue.map((func)=>func(stat2?.player.stats.MurderMystery, ''));
    const zippedCol = zip(statCol1, statCol2);
    const winnerArr = zippedCol.reduce((pV, cV)=>{
      pV[cV[1] > cV[0] ? 1 : 0] += 1;
      return pV;
    }, [0, 0]);
    let winner = '';
    if (winnerArr[0] > winnerArr[1]) winner = formatIGN(stat1.nickname, stat1.rank);
    else if (winnerArr[0] < winnerArr[1]) winner = formatIGN(stat2.nickname, stat2.rank);
    else winner = '**IT\'S A TIE!**';
    const embed = new DefaultEmbed(interaction.guild?.me || interaction.client.user)
        .addField('Players compared : ', `${formatIGN(stat1.nickname, stat1.rank)} vs ${formatIGN(stat2.nickname, stat2.rank)}`)
        .addFields(zippedCol.map(([stat1, stat2], i)=>{
          if (stats[i].includes('time')) {
            // Approximate time to make it shorter
            stat1 = fixTime(stat1);
            stat2 = fixTime(stat2);
            let t1 = formatTime(stat1).replace(/^(\S+ \S+).+$/, '$1'); // replaces 2nd word and +
            let t2 = formatTime(stat2).replace(/^(\S+ \S+).+$/, '$1'); // replaces 2nd word and +
            if (stat1 > stat2) t1 = `**${t1}**`;
            else if (stat1 < stat2) t2 = `**${t2}**`;
            return {
              name: stats[i],
              value: `${t1} vs ${t2} (approx. time)`,
              inline: true,
            };
          }
          let t1 = formatNumber(stat1);
          let t2 = formatNumber(stat2);
          if (stat1 > stat2) t1 = `**${t1}**`;
          else if (stat1 < stat2) t2 = `**${t2}**`;
          return {
            name: stats[i],
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

