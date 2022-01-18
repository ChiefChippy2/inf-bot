import {Client} from 'hypixel-api-reborn';

/**
 * @typedef {import('hypixel-api-reborn').Player} Player
 */
const Cli = new Client(process.env.KEY, {
  cache: true,
  cacheTime: 120,
});
/**
 * Get stats
 * @param {string} query Query
 * @return {Promise<Player>}
 */
export async function getStats(query) {
  return await Cli.getPlayer(query);
}


/**
 * Get stats
 * @param {string} query Query
 * @return {Promise<Record<string, any>>}
 */
export async function getStatsRaw(query) {
  return await Cli.getPlayer(query, {raw: true});
}

let mapCache = [];
/**
 * Gets all maps
 * @return {Promise<string[]>}
 */
export async function getMaps() {
  if (mapCache.length) return mapCache;
  const stats = await getStatsRaw('makoeshoi');
  const maps = Object.keys(stats?.player.stats.MurderMystery).filter((key)=>{
    return typeof key === 'string' && /^games_.+_MURDER_INFECTION$/.test(key);
  }).map((key)=>key.replace(/^games_(.+)_MURDER_INFECTION$/, (_, g1)=>g1)).sort();
  mapCache = [...maps];
  return maps;
};

export const getServerInfo = async () => await Cli.getServerInfo();
/**
 * Gets Player count for infections
 * @return {number}
 */
export const getPlayerCount = async () => (await Cli.getGameCounts()).murderMystery.modes.murderInfection;
