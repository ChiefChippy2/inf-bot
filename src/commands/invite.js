import {MessageActionRow, MessageButton} from 'discord.js';

/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */
export default {
  'name': 'invite',
  'description': 'Shows invite link',
  'options': [],
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    const link = interaction.client.generateInvite({
      permissions: 103079528512n,
      scopes: ['bot', 'applications.commands'],
    });
    const btn = new MessageButton()
        .setLabel('Link')
        .setStyle('LINK')
        .setURL(link);
    const row = new MessageActionRow()
        .addComponents(
            btn,
        );
    return await interaction.reply({
      content: `Invite link [here](${link}) or click button below`,
      components: [row],
    });
  },
};
