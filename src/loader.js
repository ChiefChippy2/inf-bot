import {fileURLToPath} from 'url';
import {readdir} from 'fs/promises';
import {dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);

/**
 * Loads Commands
 */
export async function load() {
  const dir = await readdir(join(dirname(__filename), 'commands/'));
  const commandsList = await Promise.all(dir
      .filter((name)=>name.endsWith('.js') && name !== 'example.js' && !name.startsWith('_'))
      .map(async (mod)=>{
        const imp = await import(join(dirname(__filename), 'commands/', mod));
        return imp.default;
      }));
  return commandsList;
}

/**
 * Parses cmd for easy handler
 * @param {Record<string, any>[]} cmdList CMD List
 * @return {Record<string, Record<string, any>>}
 */
export function parse(cmdList) {
  return cmdList.reduce((pV, cV)=>({...pV, [cV.name]: cV}), {});
}
