/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {DefaultEmbed, UTCtoTimestamp} from '../constants.js';
import {randUUID} from '../utils.js';
import {getLinkedUserById} from '../link/database.js';
import {MessageActionRow, MessageSelectMenu} from 'discord.js';
import {updateUserPrefs} from '../link/index.js';

export default {
  'name': 'config-dailystats',
  'description': 'Configuration for daily stat update time (only for LINKED users)!',
  'options': [],
  /**
     * handler
     * @param {Interaction} interaction
     * @param {Function} intReg
     */
  'handler': async (interaction, intReg) => {
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
  },

};


