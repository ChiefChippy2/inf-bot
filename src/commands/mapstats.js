/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getMaps, getStats, getStatsRaw} from '../API/index.js';
import {formatSnake, formatNumber} from '../utils.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed, statSelectionRow} from '../constants.js';
import {generateEmbed} from './.mapoverview.js';
const divide = Har.Utils.divide;

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
    const suffix = '_MURDER_INFECTION';
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
          await intaction.deferUpdate();
          return await interaction.editReply({
            embeds: [await generateEmbed(interaction, formattedIgn, stats, intaction?.values?.[0])],
            components: [statRow.row],
          });
        };
        const newStatRow = statSelectionRow();
        registerInteractions(newStatRow.id, selectionHandler.bind(null, intaction));
        return await intaction.reply({
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
    const playedGames = stats['games_'+map+suffix] || 0;
    const wins = stats['wins_'+map+suffix] || 0;
    const losses = playedGames - wins;
    const infKills = stats['kills_as_infected_'+map+suffix] || 0;
    const survKills = stats['kills_as_survivor_'+map+suffix] || 0;
    const deaths = stats['deaths_'+map+suffix] || 0;
    // @TODO : lognest time survived etc
    const statsEmbed = new DefaultEmbed(interaction.guild.me);
    statsEmbed
        .setTitle('Stats')
        .addField('Wins', formatNumber(wins), true)
        .addField('Losses', formatNumber(losses), true)
        .addField('Total games', formatNumber(playedGames), true)
        .addField('Kills (total)', formatNumber(infKills + survKills), true)
        .addField('Bow Kills', formatNumber(survKills), true)
        .addField('Infection Count', formatNumber(infKills), true)
        .addField('Death', formatNumber(deaths), true)
        .addField('KDR', formatNumber(divide(infKills+survKills, deaths)), true)
        .addField('WLR', formatNumber(divide(wins, losses)), true)
        .addField('Kills per game (avg.)', formatNumber(divide(infKills + survKills, playedGames)), true)
        .addField('Generation time', `${new Date().getTime() - interaction.createdTimestamp}ms`, true);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};

