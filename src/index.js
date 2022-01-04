import {config} from 'dotenv';
import {Client, Intents} from 'discord.js';
import {load, parse} from './loader.js';
import {debug} from './utils.js';
import Har from 'hypixel-api-reborn';
const Errors = Har.Errors;

config();

const cmd = parse(await load());

const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const interactionRegister = {};

/**
 * Registers interactions for a set period of time
 * @param {string} id String ID of interaction
 * @param {Function} handler Handler
 * @param {number} [expire=3600] Expiration in seconds
 */
function interactionRegistry(id, handler, expire=3600) {
  interactionRegister[id] = {run: handler, expire};
}

client.on('ready', () => {
  debug();
  setInterval(debug, 1000*60*10);
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.customId) {
    if (!interactionRegister[interaction.customId]) return await interaction.reply('Interaction expired, use the command again.');
    return await interactionRegister[interaction.customId].run(interaction, interactionRegistry);
  }

  if (!interaction.isCommand()) return;
  if (!cmd[interaction.commandName]) return await interaction.reply('This command isn\'t registered on our side!');
  console.log(`[${new Date().toISOString()}]: ${interaction.user.username} did ${interaction.commandName}`);
  try {
    await cmd[interaction.commandName]?.handler?.(interaction, interactionRegistry);
  } catch (e) {
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
  }
});

client.login(process.env.TOKEN);
