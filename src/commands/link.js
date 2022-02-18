/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {toUuid} from '../API/index.js';
import {DefaultEmbed} from '../constants.js';
import {getLinkedUserById, getLinkedUserByUUID} from '../link/database.js';
import {authenticateLink} from '../link/index.js';

export default {
  'name': 'link',
  'description': 'Links your discord account to your minecraft account',
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
    const uuid = await toUuid(ign);
    if (await getLinkedUserById(interaction.user.id) || await getLinkedUserByUUID(uuid)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new DefaultEmbed(interaction.guild?.me || interaction.client.user)
              .addField('Error', 'Your discord account is linked already or the IGN/UUID you provided is linked already.'),
        ],
      });
    }
    const res = await authenticateLink(interaction.user, uuid);
    if (!res.success) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new DefaultEmbed(interaction.guild?.me || interaction.client.user)
              .addField('Error', res.reason || 'Unknown Error'),
        ],
      });
    };
    return interaction.reply({
      ephemeral: true,
      embeds: [
        new DefaultEmbed(interaction.guild?.me || interaction.client.user)
            .addField('Success', `Your account, ${interaction.user}, has been linked with \`${ign.toLowerCase()}\`. To unlink, feel free to contact the bot owner.`),
      ],
    });
  },
};

