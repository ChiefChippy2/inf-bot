import {getStatsRaw} from '../API/index.js';
import {LinkedUser, UserStats} from '../database/index.js';

/**
 * Sets stats for a user
 * @param {string} uuid String MC UUID
 * @param {string} stats Stats
 * @return {Boolean} Whether the stats have been stored successfully
 */
export async function setUserStats(uuid, stats) {
  try {
    await UserStats.create({
      mcUuid: uuid, stats, storeTime: new Date(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets stored user stats by UUID
 * @param {string} uuid MC UUID
 * @return {UserStats|null} User, if found
 */
export async function getUserStatsByUUID(uuid) {
  const user = await UserStats.findOne({
    where: {
      mcUuid: uuid,
    },
  });
  return user;
}

/**
 * @private
 * Update a single Linked User's stored stats
 * @param {LinkedUser} linkedUser
 * @return {Boolean} Whether the update succeeded
 */
export async function updateLinkUserStats(linkedUser) {
  const uuid = linkedUser.get('mcUuid');
  const stats = await getStatsRaw(uuid);
  const mmStats = JSON.stringify(stats?.player.stats.MurderMystery || {});
  try {
    await UserStats.upsert({
      mcUuid: uuid, stats: mmStats, storeTime: new Date(),
    });
    await linkedUser.update({'statsLastUpdated': new Date()});
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates all stats for linked users
 */
export async function updateLinkedUsersStats() {
  console.log('Batch updating linked user stats...');
  const hr = new Date().getUTCHours();
  const curDate = new Date().setMinutes(0);
  // Get count of users that want an immediate reset

  const {count, rows} = await LinkedUser.findAndCountAll({where: {updateDailyStatsTime: hr}});
  if (count === 0) return; // Nothing to be done here
  const updateAmount = Math.ceil(count / 8); // Should be 12 cuz every 5 mins, but might as well do more than expected.
  const updates = rows
      .filter((x) => new Date(x.get('statsLastUpdated')).getTime() < curDate).slice(0, updateAmount)
      .map((user) => updateLinkUserStats(user));
  await Promise.allSettled(updates);
}
