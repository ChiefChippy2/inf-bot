import {config} from 'dotenv';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {load} from '../loader.js';

config();


const GUILD_ID = process.argv[2] || process.env.GUILD_ID;
const CLIENT_ID = process.argv[3] || process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN || process.argv[4];

if (!CLIENT_ID || !GUILD_ID) {
  console.log('CLIENT_ID and/or GUILD_ID is missing');
  process.exit();
}

const commands = await Promise.all((await load()).map(async (x)=>{
  delete x.handler;
  x.name = 'test4'+x.name;
  x.description = '[TEST]' + x.description;
  return x.dynamic ? await x.deploy(x) : x;
}));
console.log(commands);

const rest = new REST({version: '9'}).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        {body: commands},
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
})();
