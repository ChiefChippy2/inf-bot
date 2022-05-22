import {LinkedUser} from '../database/index.js';

/**
 * Adds a linked user
 * @param {string} id Discord ID
 * @param {string} uuid String MC UUID
 * @param {number} method Link Method
 * @return {Boolean} Whether the user has been linked successfully
 */
export async function addLinkedUser(id, uuid, method) {
  try {
    await LinkedUser.create({
      discordId: id, mcUuid: uuid, linkmethod: method, linkedAt: new Date(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets linked user by Discord ID
 * @param {string} discordId Discord ID
 * @return {Promise<LinkedUser|null>} User, if found
 */
export async function getLinkedUserById(discordId) {
  const user = await LinkedUser.findOne({
    where: {
      discordId,
    },
  });
  return user;
}

/**
 * Gets linked user by Discord ID
 * @param {string} uuid MC UUID
 * @return {Promise<LinkedUser|null>} User, if found
 */
export async function getLinkedUserByUUID(uuid) {
  const user = await LinkedUser.findOne({
    where: {
      mcUuid: uuid,
    },
  });
  return user;
}
