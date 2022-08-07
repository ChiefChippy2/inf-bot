import {Op} from 'sequelize';
import {getStatsRaw} from '../API/index.js';
import {LinkedUser, UserStats} from '../database/index.js';
import {monthDays} from '../utils.js';

/**
 * Sets stats for a user
 * @param {string} uuid String MC UUID
 * @param {string} stats Stats
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 * @deprecated Why are you still here
 * @return {Boolean} Whether the stats have been stored successfully
 */
export async function setUserStats(uuid, stats, type = 'DAILY') {
  try {
    await UserStats.create({
      mcUuid: uuid, stats, storeTime: new Date(), type, computedUniqueKey: `${uuid}-${type}`,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets stored user stats by UUID
 * @param {string} uuid MC UUID
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 * @return {UserStats|null} User, if found
 */
export async function getUserStatsByUUID(uuid, type = 'DAILY') {
  const user = await UserStats.findOne({
    where: {
      mcUuid: uuid,
      type,
    },
  });
  return user;
}

/**
 * @private
 * Update a single Linked User's stored stats
 * @param {LinkedUser} linkedUser
 * @param {'DAILY'|'WEEKLY'|'MONTHLY'} type
 * @return {Boolean} Whether the update succeeded
 */
export async function updateLinkUserStats(linkedUser, type = 'DAILY') {
  const uuid = linkedUser.get('mcUuid');
  const stats = await getStatsRaw(uuid);
  const mmStats = stats?.player.stats.MurderMystery || {};
  for (const key in mmStats) {
    if (!Object.prototype.hasOwnProperty.call(mmStats, key)) continue;
    if (key.endsWith('MURDER_INFECTION')) continue;
    delete mmStats[key];
  }
  const finalMMStats = JSON.stringify(mmStats);
  try {
    await UserStats.upsert({
      mcUuid: uuid, stats: finalMMStats, storeTime: new Date(), type, computedUniqueKey: `${uuid}-${type}`,
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
  const curDate = new Date().setUTCMinutes(0);
  const isWeekEnd = new Date().getUTCDay() === (hr >= 12 ? 0 : 1);
  const isMonthEnd = new Date().getUTCDate() === (hr >= 12 ? monthDays(Date.now()-10000) : 1);
  // Get count of users that want an immediate reset

  const {count, rows} = await LinkedUser.findAndCountAll({where: {
    [Op.or]: {
      updateDailyStatsTime: hr,
      statsLastUpdated: {[Op.lte]: new Date(Date.now() - 1000 * 60 * 60 * 25)},
    }}});
  if (count === 0) return console.log('Nothing to update'); // Nothing to be done here
  const updateAmount = Math.ceil(count / 8); // Should be 12 cuz every 5 mins, but might as well do more than expected.
  const updates = rows
      .filter((x) => new Date(x.get('statsLastUpdated')).getTime() < curDate).slice(0, updateAmount)
      .map((user) => {
        const promises = [updateLinkUserStats(user, 'DAILY')];
        if (isWeekEnd) promises.push(updateLinkUserStats(user, 'WEEKLY'));
        if (isMonthEnd) promises.push(updateLinkUserStats(user, 'MONTHLY'));
        return promises;
      }).flat();
  console.log('Updating', updates.length);
  await Promise.allSettled(updates);
  console.log('Done, updated', updates.length);
}
