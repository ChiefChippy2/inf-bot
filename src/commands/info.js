import {getPlayerCount, getServerInfo} from '../API/index.js';
import {DefaultEmbed} from '../constants.js';

/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

export default {
  'name': 'info',
  'description': 'Gives some server info, whether it be hypixel or InfBot\'s',
  'options': [],
  'dynamic': false,
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    const invLink = interaction.client.generateInvite({
      permissions: 103079528512n,
      scopes: ['bot', 'applications.commands'],
    });
    const userPing = Date.now() - interaction.createdTimestamp;
    const serverInfo = await getServerInfo();
    const pCount = await getPlayerCount();
    const memUsage = Object.values(process.memoryUsage()).reduce((a, c)=>a+c, 0) / 1024 ** 2;
    const rng = Math.floor(Math.random() * 10);
    const version = process.version;
    const minEstPing = userPing < serverInfo.ping ? serverInfo.ping - userPing : userPing - serverInfo.ping;
    const maxEstPing = userPing + serverInfo.ping;
    await interaction.reply({
      embeds: [
        new DefaultEmbed(interaction.guild?.me || interaction.client)
            .setDescription('Latest Updates: /dailystats and /link')
            .addField('Bot responded after: ', `${userPing} ms`, true)
            .addField('Bot\'s ping to discord', `${interaction.client.ws.ping} ms`, true)
            .addField('Bot\'s memory usage', `${memUsage.toFixed(2)} MB (approx.)`, true)
            .addField('Bot\'s node runtime version', `${version}`, true)
            .addField('Random number', `${rng}`, true)
            .addField('Bot\'s ping to hypixel', `${serverInfo.ping} ms`, true)
            .addField('Your estimated ping to hypixel', `${minEstPing} to ${maxEstPing} ms (approx.)`, true)
            .addField('Hypixel player count', `${serverInfo.players.online} / ${serverInfo.players.max}`)
            .addField('Infection player count', `${pCount}`, true)
            .addField('Bot guild count', `${interaction.client.guilds.cache.size} (approx.) [Invite me](${invLink})`, true)
            .addField('Bot user count', `${interaction.client.users.cache.size || 0} (even more approx.)`, true),
      ],
    });
  },
};
