import {config} from 'dotenv';
import {Client, Intents} from 'discord.js';
import {load, parse} from './loader.js';
import {debug} from './utils.js';
import Har from 'hypixel-api-reborn';
const Errors = Har.Errors;

config();

const DEBUG = process.argv.includes('--debug');

if (DEBUG) console.log('Debug mode ON');

const cmd = parse(await load());

const client = new Client({intents: [Intents.FLAGS.GUILDS], presence: {
  activities: [
    {
      name: 'Infection Stats',
      type: 'STREAMING',
      url: 'https://not.a.url',
    },
    {
      name: 'Infection',
      type: 'PLAYING',
    },
  ],
}});
const interactionRegister = {};

/**
 * Registers interactions for a set period of time
 * @param {string} id String ID of interaction
 * @param {Function} handler Handler
 * @param {number} [expire=600] Expiration in seconds
 */
function interactionRegistry(id, handler, expire=600) {
  interactionRegister[id] = {run: handler, expire: expire+Date.now()};
}

/**
 * Cleans registry
 */
function cleanRegistry() {
  for (const [key, {expire}] in interactionRegister) {
    if (expire <= Date.now()) delete interactionRegister[key];
  }
}

client.on('ready', () => {
  debug();
  setInterval(debug, 1000*60*5);
  setInterval(cleanRegistry, 1000*30);
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (DEBUG) console.log(interaction);
  // Don't bother responding to test
  if (process.env.ENV === 'PROD' && interaction.guildId === process.env.GUILD_ID && interaction.channelId === process.env.TEST_CHANNEL) return;
  // Similarly, DEV shouldn't respond to other global cmds
  if (process.env.ENV === 'DEV' && interaction.guildId !== process.env.GUILD_ID) return;
  if (interaction.customId) {
    // Only say expired on production
    if (!interactionRegister[interaction.customId] && process.env.ENV === 'PROD') {
      return await interaction.reply({
        content: 'Interaction expired, use the command again.',
        ephemeral: true,
      }).catch(console.log);
    }
    try {
      return await interactionRegister[interaction.customId].run(interaction, interactionRegistry);
    } catch (e) {
      if (e.message === Errors.PLAYER_DOES_NOT_EXIST) {
        return await interaction.reply({
          content: 'No player with given IGN',
          ephemeral: true,
        });
      }
    }
  }

  if (!interaction.isCommand()) return;
  // Handle test commands
  if (interaction.commandName.startsWith('test4') && process.env.ENV === 'PROD') return; // Don't handle Test cmds on prod
  if (!interaction.commandName.startsWith('test4') && process.env.ENV === 'DEV') return; // Don't handle global cmds on test
  if (process.env.ENV === 'DEV') interaction.commandName = interaction.commandName.replace(/^test4/, '');
  if (!cmd[interaction.commandName]) return await interaction.reply('This command isn\'t registered on our side!').catch(console.log);
  console.log(`[${new Date().toISOString()}]: ${interaction.user.username} did ${interaction.commandName}`);
  try {
    // await interaction.deferReply();
    await cmd[interaction.commandName]?.handler?.(interaction, interactionRegistry);
  } catch (e) {
    try {
      if (e.message === Errors.PLAYER_DOES_NOT_EXIST) {
        return await interaction.reply({
          content: 'No player with given IGN',
          ephemeral: true,
        });
      }
      // Other errors
      console.error(e);
      await interaction.reply({
        content: 'An error happened whilst executing the interaction',
        ephemeral: true,
      });
    } catch (e) {
      console.error('Error happened whilst handling error : timeout?');
    }
  }
});
if (DEBUG) {
  client.on('debug', console.log);
  client.on('warn', console.log);
}
client.login(process.env.TOKEN);
