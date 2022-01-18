import {MessageActionRow, MessageButton} from 'discord.js';
import Har from 'hypixel-api-reborn';
import {getStats} from '../API/index.js';
import {DefaultEmbed} from '../constants.js';
const HyUtils = Har.Utils;

/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

export default {
  'name': 'who',
  'description': 'Looks up a player by IGN or UUID and gives name history',
  'options': [
    {
      'type': 3,
      'name': 'ign',
      'description': 'IGN or UUID',
      'required': true,
    },
  ],
  'dynamic': false,
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    const data = interaction.options.get('ign').value;
    let uuid = data;
    try {
      if (!HyUtils.isUUID(data)) uuid = await HyUtils.toUuid(data);
    } catch (e) {
      return await interaction.reply('IGN incorrect');
    }
    const ign = await HyUtils.toIGN(uuid);
    const imgUrl = `https://visage.surgeplay.com/full/512/${uuid}.png?tilt=0`;
    const player = await getStats(uuid);
    const sm = player.socialMedia;
    const embed = new DefaultEmbed(interaction.guild?.me || interaction.client.user)
        .setImage(imgUrl)
        .addField('IGN', ign)
        .addField('UUID', `\`${uuid}\``)
        .addField('Status', player.isOnline ? `Online, playing ${player.recentlyPlayedGame?.name || 'Unknown'}`: 'Offline')
        .addField('Social Media', sm.map((sm)=>`${sm.name} : ${sm.link}`).join('\n'))
        .setDescription('Skin from [Surgeplay](https://visage.surgeplay.com/)');
    const row = new MessageActionRow().addComponents(
        new MessageButton().setStyle('LINK').setLabel('NameMC').setURL(`https://www.namemc.com/${ign}`),
        new MessageButton().setStyle('LINK').setLabel('Steal skin').setURL(`https://minecraft.net/profile/skin/remote?url=https://crafatar.com/skins/${uuid}`),
    );
    await interaction.reply({
      components: [row],
      embeds: [embed],
    });
  },
};
