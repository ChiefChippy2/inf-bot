/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {getStatsRaw} from '../API/index.js';
import {DefaultEmbed, stats, statToValue, UTCtoTimestamp} from '../constants.js';
import {formatTime, formatNumber, formatIGN, deltaJson, randUUID} from '../utils.js';
import {getLinkedUserById} from '../link/database.js';
import {getUserStatsByUUID} from '../stats/dailystats.js';
import {MessageActionRow, MessageSelectMenu} from 'discord.js';
import {updateUserPrefs} from '../link/index.js';

export default {
  'name': 'dailystats',
  'description': '[BETA] Shows your daily stats (only for LINKED users)!',
  'options': [{
    'type': 3,
    'name': 'config',
    'description': 'Configurations for Daily Stats',
    'choices': [
      {
        'name': 'Refresh time - when daily stats will be reset',
        'value': 'refresh_time',
      },
    ],
  }],
  /**
    * handler
    * @param {Interaction} interaction
    * @param {Function} intReg
    */
  'handler': async (interaction, intReg) => {
    const linkedUser = await getLinkedUserById(interaction.user.id);
    if (!linkedUser) {
      return interaction.reply({
        // eslint-disable-next-line max-len
        content: `Your discord account isn't linked to a minecraft account. This is mandatory for daily stats to prevent storing excessive data.
- Tip: to link your account, do \`/link ign\``,
      });
    };
    if (interaction.options.get('config')?.value === 'refresh_time') {
      const id = `tz_select${randUUID()}`;
      interaction.reply({
        ephemeral: true,
        content: 'Please select the time slot that fits you the best',
        embeds: [
          new DefaultEmbed(interaction.guild?.me || interaction.client.user)
              .setTitle('When do you want your stats to be reset?')
              .setDescription('Depending on the number of linked users that wants to, your stats might take up to 1 hour to be reset.')
              .addField('The midnights for each timezone corresponds to (for you): ', UTCtoTimestamp.map((data)=>`UTC ${data.timezone}: ${data.discordFormat}`).join('\n')),
        ],
        components: [new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId(id)
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder('Select a timeslot')
            .addOptions(UTCtoTimestamp.map((data)=>({
              label: `Midnight - UTC ${data.timezone} (${data.specialTimeZone})`,
              value: data.hour.toString(),
            }))))],
      });
      return intReg(id, async (interaction) => {
        const val = interaction?.values?.[0];
        const linkedUser = await getLinkedUserById(interaction.user.id);
        if (await updateUserPrefs(linkedUser, 'updateDailyStatsTime', parseInt(val))) {
          return interaction.reply({
            content: 'Success!',
            embeds: [],
            components: [],
            ephemeral: true,
          });
        } else {
          return interaction.reply({
            content: 'Something went wrong, try again later!',
            embeds: [],
            components: [],
            ephemeral: true,
          });
        }
      }, 60 * 10);
    }
    const storedStats = await getUserStatsByUUID(linkedUser.get('mcUuid'));
    if (!storedStats || !storedStats.get('stats')) {
      return interaction.reply({
        content: 'No stored stats is found. Please try again later (this might be because you linked your account recently).',
      });
    };
    const storedInfStats = JSON.parse(storedStats.get('stats'));
    const currentStats = await getStatsRaw(linkedUser.get('mcUuid'));
    const curInfStats = currentStats?.player.stats.MurderMystery;
    if (!curInfStats || curInfStats.games_MURDER_INFECTION <= storedInfStats.games_MURDER_INFECTION) {
      return interaction.reply({
        content: `You haven't played any games of infections since the last reset... (${formatTime((Date.now() - linkedUser.get('statsLastUpdated')) / 1000)} ago)`,
      });
    }
    const statImprovement = deltaJson(storedInfStats, curInfStats);
    const statCol = statToValue.map((func)=>func(statImprovement, ''));
    const embed = new DefaultEmbed(interaction?.guild.me || interaction.client.user)
        .setTitle(`Daily stats of ${formatIGN(currentStats.nickname, currentStats.rank)}`)
        .setDescription(`Last reset : ${formatTime((Date.now() - linkedUser.get('statsLastUpdated'))/1000)} ago
Next reset in ${formatTime((linkedUser.get('statsLastUpdated') - Date.now() + 1000 * 60 * 60 * 24)/1000)}`)
        .addFields(statCol.map((stat, i)=>({
          name: stats[i],
          value: (stats[i].includes('time') ? formatTime : formatNumber)(stat),
          inline: true,
        })));
    await interaction.reply({
      embeds: [embed],
    });
  },
};

