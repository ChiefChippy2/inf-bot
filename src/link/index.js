// import {Client} from 'node-mcauth';
// TBD : new Client(process.env.MS_ID, process.env.MS_SECRET, '', {})

import {getStats} from '../API/index.js';
import {addLinkedUser} from './database.js';

/**
 * @typedef {import('discord.js').User} User
 * @typedef {Object} LinkStatus
 * @property {Boolean} success
 * @property {string} reason
 * @typedef {import('../database/index.js').LinkedUser} LinkedUser
*/

/**
 * Authenticates an attempt to link
 * @param {User} user User
 * @param {string} uuid MC UUID
 * @return {LinkStatus} whether it is authenticated
 */
export async function authenticateLink(user, uuid) {
  const stats = await getStats(uuid);
  const username = stats.socialMedia.find((x)=>x.id === 'DISCORD')?.link;
  if (!username) return {success: false, reason: 'No discord account linked with provided username'};
  const [name, tag] = username.split('#');
  if (name.trim() !== user.username || tag.trim() !== user.discriminator) return {success: false, reason: 'Linked discord account doesn\'t match!'};
  if (!await addLinkedUser(user.id.toString(), uuid, 1)) return {success: false, reason: 'Failed linking : a user is already linked with similar details'};
  return {success: true};
}

/**
 * @private
 * Update a single Linked User's stored stats
 * @param {LinkedUser} linkedUser
 * @param {string} prefName name of config
 * @param {*} prefVal value
 * @return {Boolean} Whether the update succeeded
 */
export async function updateUserPrefs(linkedUser, prefName, prefVal) {
  try {
    await linkedUser.update({
      [prefName]: prefVal,
    });
    return true;
  } catch {
    return false;
  }
}
