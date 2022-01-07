/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStats, getStatsRaw} from '../API/index.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed} from '../constants.js';
import {formatTime, formatNumber, fixTime} from '../utils.js';
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
    const rstats = rawStats?.player.stats.MurderMystery || {};
    const losses = stats.playedGames - stats.wins;
    const kills = (rstats.kills_as_infected_MURDER_INFECTION || 0) + (rstats.kills_MURDER_INFECTION || 0);
    const lst = fixTime(rstats.total_time_survived_seconds_MURDER_INFECTION || 0);
    const bst = fixTime(rstats.longest_time_as_survivor_seconds_MURDER_INFECTION || 0);
    const coins = (rstats.coins_pickedup_MURDER_INFECTION || 0);
    const statsEmbed = new DefaultEmbed(interaction.guild.me);
    statsEmbed
        .setTitle('Stats')
        .addField('Wins', formatNumber(stats.wins), true)
        .addField('Losses', formatNumber(losses), true)
        .addField('Total games', formatNumber(stats.playedGames), true)
        .addField('Kills (total)', formatNumber(kills), true)
        .addField('Bow Kills', formatNumber(stats.kills), true)
        .addField('Infection Count', formatNumber(rstats.kills_as_infected_MURDER_INFECTION || 0), true)
        .addField('Deaths', formatNumber(stats.deaths), true)
        .addField('Trap Kills', formatNumber(rstats.trap_kills_MURDER_INFECTION || 0), true)
        .addField('Trap kills per 1k games', formatNumber(divide(rstats.trap_kills_MURDER_INFECTION * 1e3, stats.playedGames)), true)
        .addField('KDR', formatNumber(divide(kills, stats.deaths)), true)
        .addField('WLR', formatNumber(divide(stats.wins, losses)), true)
        .addField('Kills per game (avg.)', formatNumber(divide(kills, stats.playedGames)), true)
        .addField('Bow kill to Infection ratio', stats.kills > 0 ? `1:${divide(kills - stats.kills, stats.kills)}` : 'N/A', true)
        .addField('Coins picked up', formatNumber(coins), true)
        .addField('Coins per game (avg.)', formatNumber(divide(coins, stats.playedGames)), true)
        .addField('Total survived time', formatTime(lst), true)
        .addField('Longest survived time', formatTime(bst), true)
        .addField('Average survival time', formatTime(divide(lst, stats.playedGames)), true);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};