/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStats, getStatsRaw} from '../API/index.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed} from '../constants.js';
import {formatTime, formatNumber, fixTime, formatIGN} from '../utils.js';
import {lb} from '../stats/leaderboard.js';
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
    const formattedIgn = formatIGN(allStats.nickname, allStats.rank);
    const stats = allStats.stats.murdermystery.infection;
    const rstats = rawStats?.player.stats.MurderMystery || {};
    const losses = stats.playedGames - stats.wins;
    const survKills = rstats.kills_as_survivor_MURDER_INFECTION || 0;
    const kills = (rstats.kills_as_infected_MURDER_INFECTION || 0) + survKills;
    const lst = fixTime(rstats.total_time_survived_seconds_MURDER_INFECTION || 0, rstats);
    const bst = fixTime(rstats.longest_time_as_survivor_seconds_MURDER_INFECTION || 0, rstats);
    const coins = (rstats.coins_pickedup_MURDER_INFECTION || 0);

    // lb shenanigans :
    const lbData = await lb.getLB();
    const SKSpot = lbData.survivorKills.findIndex((x)=>x.ign === allStats.nickname);
    const SKAddon = SKSpot > -1 ? ` (#${SKSpot+1} All time*)` : '';
    const IKSpot = lbData.infectedKills.findIndex((x)=>x.ign === allStats.nickname);
    const IKAddon = SKSpot > -1 ? ` (#${IKSpot+1} All time)` : '';

    const statsEmbed = new DefaultEmbed(interaction.guild?.me || interaction.client.user);
    statsEmbed
        .setTitle('Stats')

        .addField('Hypixel Level', `Level ${allStats.level} (${allStats.levelProgress.percent}% to next lvl)`, true)
        .addField('Karma', `${allStats.karma} Karma`, true)
        .addField('Achievement Points', `${allStats.achievementPoints} pts`, true)

        .addField('Wins', formatNumber(stats.wins), true)
        .addField('Losses', formatNumber(losses), true)
        .addField('Total games', formatNumber(stats.playedGames), true)

        .addField('Kills (total)', formatNumber(kills), true)
        .addField('Bow Kills', formatNumber(survKills) + SKAddon, true)
        .addField('Infection Count', formatNumber(rstats.kills_as_infected_MURDER_INFECTION || 0) + IKAddon, true)

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
        .addField('Gold picked up', formatNumber(coins), true)
        .addField('Gold per game', formatNumber(divide(coins, stats.playedGames)), true)

        .addField(`Total survived time ${lst.approximate ? ' (approx.)' : ''}`, formatTime(lst.value || lst), true)
        .addField(`Longest survived time ${bst.approximate ? ' (approx.)' : ''}`, formatTime(bst.value || bst), true)
        .addField(`Average survival time ${lst.approximate ? ' (Pre-defined value)' : ''}`, formatTime(divide(lst.value || lst, stats.playedGames)), true)

        .addField('\u200B', '*Survivor kills leaderboard position might be very inaccurate, please take with a grain of salt')
        .setThumbnail(`https://visage.surgeplay.com/head/${allStats.uuid}.png`);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};
