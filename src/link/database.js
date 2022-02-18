import {LinkedUser} from '../database/index.js';

/**
 * Adds a linked user
 * @param {BigInt} id Discord ID
 * @param {string} uuid String MC UUID
 * @param {number} method Link Method
 * @return {Boolean} Whether the user has been linked successfully
 */
export async function addLinkedUser(id, uuid, method) {
  try {
    await LinkedUser.create({
      discordId: id, mcUuid: uuid, linkMethod: method, linkedAt: new Date(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets linked user by Discord ID
 * @param {BigInt} discordId Discord ID
 * @return {LinkedUser|null} User, if found
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
 * @return {LinkedUser|null} User, if found
 */
export async function getLinkedUserByUUID(uuid) {
  const user = await LinkedUser.findOne({
    where: {
      mcUuid: uuid,
    },
  });
  return user;
}
