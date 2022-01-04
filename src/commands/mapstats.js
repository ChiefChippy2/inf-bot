/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getMaps, getStats, getStatsRaw} from '../API/index.js';
import {formatSnake} from '../utils.js';
import Har from 'hypixel-api-reborn';
import {DefaultEmbed, statSelectionRow} from '../constants.js';
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
      const mapList = await getMaps();
      const statsPerMap = mapList.map((name)=>[
        name,
        divide(stats['kills_as_infected_'+name+suffix] + stats['kills_as_survivor_'+name+suffix], stats['games_'+name+suffix]),
      ]).sort((a, b)=>b[1]-a[1]).map(([name, val], i)=>`${i+1}. ${formatSnake(name)}: \`${val}\` kills per game`);
      const displayFields = [];
      while (statsPerMap.length > 0) {
        displayFields.push({
          name: '\u200B',
          value: statsPerMap.splice(0, 5).join('\n'),
        });
      }
      const statsEmbed = new DefaultEmbed(interaction.guild.me);
      statsEmbed
          .setTitle(`Map overview, stats of ${formattedIgn}`)
          .addFields(displayFields);
      const statRow = statSelectionRow();
      registerInteractions(statRow.id, (intaction)=>intaction.reply({content: '#SoonTM', ephemeral: true}));
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

