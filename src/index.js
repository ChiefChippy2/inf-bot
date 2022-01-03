import {config} from 'dotenv';
import {Client, Intents} from 'discord.js';
import {load, parse} from './loader.js';

config();

const cmd = parse(await load());

const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (!cmd[interaction.commandName]) {
    // eslint-disable-next-line max-len
    return await interaction.reply('This command isn\'t registered on our side!');
  }
  // eslint-disable-next-line max-len
  console.log(`[${new Date().toISOString()}]: ${interaction.user.username} did ${interaction.commandName}`);
  try {
    await cmd[interaction.commandName]?.handler?.(interaction);
  } catch (e) {
    console.error(e);
    await interaction.reply('An error happened whilst executing interaction');
  }
});

client.login(process.env.TOKEN);
