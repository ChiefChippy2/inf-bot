import {config} from 'dotenv';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {load} from '../loader.js';
import {wait} from '../utils.js';

config();

const CLIENT_ID = process.argv[2] || process.env.CLIENT_ID;
if (!CLIENT_ID) {
  console.log('No CLIENT_ID provided');
  process.exit();
}

console.log('Deploying to production... (3s)');
await wait(3000);
console.log('Deploying...');

const commands = await Promise.all((await load()).map(async (x)=>{
  delete x.handler;
  return x.dynamic ? await x.deploy(x) : x;
}));

const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        {body: commands},
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
})();
