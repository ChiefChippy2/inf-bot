/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStats, getStatsRaw} from '../API/index.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed} from '../constants.js';
import {formatTime, formatNumber, fixTime} from '../utils.js';
const divide = Har.Utils.divide;

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
    return await interaction.reply('SoonTM');
    // @TODO
    const ign = interaction.options.get('ign1').value;
    const allStats = await getStats(ign);
    const rawStats = await getStatsRaw(ign);
    const formattedIgn = `[${allStats.rank}] ${allStats.nickname}`;
    const stats = allStats.stats.murdermystery.infection;
    const rstats = rawStats?.player.stats.MurderMystery || {};
    const losses = stats.playedGames - stats.wins;
    const survKills = rstats.kills_as_survivor_MURDER_INFECTION || 0;
    const kills = (rstats.kills_as_infected_MURDER_INFECTION || 0) + survKills;
    const lst = fixTime(rstats.total_time_survived_seconds_MURDER_INFECTION || 0);
    const bst = fixTime(rstats.longest_time_as_survivor_seconds_MURDER_INFECTION || 0);
    const coins = (rstats.coins_pickedup_MURDER_INFECTION || 0);
    const statsEmbed = new DefaultEmbed(interaction.guild?.me || interaction.client.user);
    statsEmbed
        .setTitle('Stats')
        .addField('Wins', formatNumber(stats.wins), true)
        .addField('Losses', formatNumber(losses), true)
        .addField('Total games', formatNumber(stats.playedGames), true)

        .addField('Kills (total)', formatNumber(kills), true)
        .addField('Bow Kills', formatNumber(survKills), true)
        .addField('Infection Count', formatNumber(rstats.kills_as_infected_MURDER_INFECTION || 0), true)

        .addField('Trap Kills', formatNumber(rstats.trap_kills_MURDER_INFECTION || 0), true)
        .addField('Final Bow Kills', formatNumber(rstats.bow_kills_MURDER_INFECTION || 0), true)
        .addField('(Final) Deaths', formatNumber(stats.deaths), true)

        .addField('WLR', formatNumber(divide(stats.wins, losses)), true)
        .addField('KDR', formatNumber(divide(kills, stats.deaths)), true)
        .addField('FKDR', formatNumber(divide(rstats.bow_kills_MURDER_INFECTION, stats.deaths)), true)

        .addField('Kills per game (avg.)', formatNumber(divide(kills, stats.playedGames)), true)
        .addField('Final Bow Kills per game', formatNumber(divide(rstats.bow_kills_MURDER_INFECTION, stats.playedGames)), true)
        .addField('Last one alive count', formatNumber(rstats.last_one_alive_MURDER_INFECTION || 0), true)

        .addField('Bow kill to Infection ratio', survKills > 0 ? `1:${divide(rstats.kills_as_infected_MURDER_INFECTION || 0, survKills)}` : 'N/A', true)
        .addField('Coins picked up', formatNumber(coins), true)
        .addField('Coins per game', formatNumber(divide(coins, stats.playedGames)), true)

        .addField('Total survived time', formatTime(lst), true)
        .addField('Longest survived time', formatTime(bst), true)
        .addField('Average survival time', formatTime(divide(lst, stats.playedGames)), true);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};

