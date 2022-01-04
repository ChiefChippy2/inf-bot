/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStats, getStatsRaw} from '../API/index.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed} from '../constants.js';
const divide = Har.Utils.divide;

export default {
  'name': 'stats',
  'description': 'Returns basic infection stats',
  'options': [
    {
      'type': 3,
      'name': 'ign',
      'description': 'IGN (or uuid)',
      'required': true,
    },
  ],
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    // Code here...
    const ign = interaction.options.get('ign').value;
    const allStats = await getStats(ign);
    const rawStats = await getStatsRaw(ign);
    const formattedIgn = `[${allStats.rank}] ${allStats.nickname}`;
    const stats = allStats.stats.murdermystery.infection;
    const losses = stats.playedGames - stats.wins;
    const kills = stats.kills + (rawStats?.player.stats.MurderMystery.kills_as_infected_MURDER_INFECTION || 0);
    const statsEmbed = new DefaultEmbed(interaction.guild.me);
    statsEmbed
        .setTitle('Stats')
        .addField('Wins', stats.wins.toString(), true)
        .addField('Losses', losses.toString(), true)
        .addField('Total games', stats.playedGames.toString(), true)
        .addField('Kills (total)', kills.toString(), true)
        .addField('Bow Kills', stats.kills.toString(), true)
        .addField('Infection Count', (kills-stats.kills).toString(), true)
        .addField('Death', stats.deaths.toString(), true)
        .addField('KDR', stats.KDRatio.toString(), true)
        .addField('WLR', divide(stats.wins, losses).toString(), true)
        .addField('Kills per game (avg.)', divide(kills, stats.playedGames).toString(), true)
        .addField('Generation time', `${new Date().getTime() - interaction.createdTimestamp}ms`, true);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};
