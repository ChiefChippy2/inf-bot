import har from 'hypixel-api-reborn';

const {Client, Utils} = har;

/**
 * @typedef {import('hypixel-api-reborn').Player} Player
 */
const Cli = new Client(process.env.KEY, {
  cache: true,
  cacheTime: 120,
  rateLimit: 'AUTO',
  keyLimit: 60,
});
/**
 * Get stats
 * @param {string} query Query
 * @param {Record<string, any>} [options]
 * @return {Promise<Player>}
 */
export async function getStats(query, options) {
  return await Cli.getPlayer(query, options);
}

export const toUuid = Utils.toUuid;

/**
 * Get stats
 * @param {string} query Query
 * @return {Promise<Player>}
 */
export async function getStatsRaw(query) {
  const rStats = await Cli.getPlayer(query, {raw: true});
  const stats = await Cli.getPlayer(query);
  return {...rStats, ...stats};
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
