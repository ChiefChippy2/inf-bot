/* eslint-disable max-len */
/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {MessageEmbed} from 'discord.js';
import {getStats, getStatsRaw} from '../API/index.js';
import {formatSnake} from '../utils.js';
import Har from 'hypixel-api-reborn';
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
    const stats = await getStatsRaw('makoeshoi');
    const maps = Object.keys(stats?.player.stats.MurderMystery).filter((key)=>{
      return typeof key === 'string' && /^games_.+_MURDER_INFECTION$/.test(key);
    }).map((key)=>{
      const finalKey = key.replace(/^games_(.+)_MURDER_INFECTION$/, (x, g1)=>g1);
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
    */
  'handler': async (interaction) => {
    const suffix = '_MURDER_INFECTION';
    const ign = interaction.options.get('ign').value;
    const map = interaction.options.get('map')?.value;
    if (!map) {
      return interaction.reply('You must provide `map` FTM.', {ephemeral: true});
    }
    const allStats = await getStats(ign);
    const rawStats = await getStatsRaw(ign);
    const formattedIgn = `[${allStats.rank}] ${allStats.nickname}`;
    const stats = rawStats?.player.stats.MurderMystery;
    if (!stats) {
      return interaction.reply('This player has no MM stats', {ephemeral: true});
    }
    const playedGames = stats['games_'+map+suffix] || 0;
    const wins = stats['wins_'+map+suffix] || 0;
    const losses = playedGames - wins;
    const infKills = stats['kills_as_infected_'+map+suffix] || 0;
    const survKills = stats['kills_as_survivor_'+map+suffix] || 0;
    const deaths = stats['deaths_'+map+suffix] || 0;
    // @TODO : lognest time survived etc
    const statsEmbed = new MessageEmbed();
    statsEmbed
        .setTitle('Stats')
        .setFooter({
          text: `Revealed by your bot, ${interaction.guild.me.displayName}`,
        })
        .setTimestamp()
        .addField('Wins', wins.toString(), true)
        .addField('Losses', losses.toString(), true)
        .addField('Total games', playedGames.toString(), true)
        .addField('Kills (total)', (infKills + survKills).toString(), true)
        .addField('Bow Kills', survKills.toString(), true)
        .addField('Infection Count', infKills.toString(), true)
        .addField('Death', deaths.toString(), true)
        .addField('KDR', divide(infKills+survKills, deaths).toString(), true)
        .addField('WLR', divide(wins, losses).toString(), true)
        .addField('Kills per game (avg.)', divide(infKills + survKills, playedGames).toString(), true)
        .addField('Generation time', `${new Date().getTime() - interaction.createdTimestamp}ms`, true);
    await interaction.reply({
      'content': `Here are the stats of ${formattedIgn}`,
      'embeds': [statsEmbed],
    });
  },
};

