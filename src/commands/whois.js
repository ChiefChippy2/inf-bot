import {MessageActionRow, MessageButton} from 'discord.js';
import Har from 'hypixel-api-reborn';
import {getStats} from '../API/index.js';
import {DefaultEmbed} from '../constants.js';
import {formatIGN, formatTime} from '../utils.js';
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
    const player = await getStats(uuid, {guild: true});
    const sm = player.socialMedia;
    const lastSeen = player.lastLogoutTimestamp ? `${formatTime((Date.now() - player.lastLogoutTimestamp) / 1000)} ago` : '[Status API disabled]';
    const embed = new DefaultEmbed(interaction.guild?.me || interaction.client.user)
        .setImage(imgUrl)
        .addField('IGN', ign)
        .addField('IGN with rank and guild tag', formatIGN(player.nickname, player.rank, player.guild?.tag))
        .addField('UUID', `\`${uuid}\``)
        .addField('Status', player.isOnline ? `Online, playing ${player.recentlyPlayedGame?.name || 'Unknown'}`: `Offline, Last seen ${lastSeen}`)
        .addField('Social Media', sm.map((sm)=>`${sm.name} : ${sm.link}`).join('\n') || 'NONE')
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
