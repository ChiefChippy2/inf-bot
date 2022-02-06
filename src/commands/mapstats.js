/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getMaps, getStats, getStatsRaw} from '../API/index.js';
import {formatSnake, formatNumber, formatTime} from '../utils.js';
import {DefaultEmbed, statSelectionRow, statToValue, stats as statCol} from '../constants.js';
import {generateEmbed} from './_mapoverview.js';

export default {
  'name': 'mapstats',
  'description': 'Returns per-map infection stats',
  'options': [
    {
      'type': 3,
      'name': 'ign',
      'description': 'IGN (or uuid)',
      'required': true,
    },
    {
      'type': 3,
      'name': 'map',
      'description': 'Map to show (will be overall if not specified)',
      'required': false,
    },
  ],
  'dynamic': true,
  'deploy': async (curObj) =>{
    const maps = (await getMaps()).map((finalKey)=>{
      return {
        name: formatSnake(finalKey),
        value: finalKey,
      };
    });
    delete curObj.dynamic;
    delete curObj.deploy;
    curObj.options[1].choices = maps;
    return curObj;
  },
  /**
    * handler
    * @param {Interaction} interaction
    * @param {Function} registerInteractions
    */
  'handler': async (interaction, registerInteractions) => {
    const ign = interaction.options.get('ign').value;
    const map = interaction.options.get('map')?.value;
    const allStats = await getStats(ign);
    const rawStats = await getStatsRaw(ign);
    const formattedIgn = `[${allStats.rank}] ${allStats.nickname}`;
    const stats = rawStats?.player.stats.MurderMystery;
    if (!stats) {
      return interaction.reply('This player has no MM stats', {ephemeral: true});
    }
    if (!map) {
      const statsEmbed = await generateEmbed(interaction, formattedIgn, stats);
      const statRow = statSelectionRow();
      const selectionHandler = async (interaction, intaction)=>{
        if (intaction.user.id === interaction.user.id) {
          return await intaction.update({
            embeds: [await generateEmbed(interaction, formattedIgn, stats, intaction?.values?.[0])],
            components: [statRow.row],
          });
        };
        const newStatRow = statSelectionRow();
        registerInteractions(newStatRow.id, selectionHandler.bind(null, intaction));
        return await intaction.reply({
          content: `Requested by ${intaction.user}`,
          embeds: [await generateEmbed(interaction, formattedIgn, stats, intaction?.values?.[0])],
          components: [newStatRow.row],
        });
      };
      registerInteractions(statRow.id, selectionHandler.bind(null, interaction));
      return interaction.reply({
        embeds: [statsEmbed],
        components: [statRow.row],
      });
    }

    const fields = statToValue.map((val, index)=>{
      const type = statCol[index].includes('time') ? formatTime : formatNumber;
      return {
        name: statCol[index],
        value: type(val(stats, '_'+map)),
        inline: true,
      };
    });

    const statsEmbed = new DefaultEmbed(interaction.guild?.me || interaction.client.user);
    statsEmbed
        .setTitle('Stats')
        .addFields(fields);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};

