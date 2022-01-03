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
 * @return {Player}
 */
export async function getStats(query) {
  return await Cli.getPlayer(query);
}


/**
 * Get stats
 * @param {string} query Query
 * @return {Record<string, any>}
 */
export async function getStatsRaw(query) {
  return await Cli.getPlayer(query, {raw: true});
}
