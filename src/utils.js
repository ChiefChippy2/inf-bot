import {parse} from 'node:path';

/**
 * Wait
 * @param {number} timeout Timeout in ms
 * @return {Promise<void>}
 */
export async function wait(timeout) {
  return await new Promise((resolve)=>setTimeout(resolve, timeout));
}

/**
 * Formats Snake case string
 * @param {string} str String to format
 * @return {string}
 */
export function formatSnake(str) {
  // eslint-disable-next-line max-len
  return str[0].toUpperCase() + str.slice(1).replace(/_./g, (x)=>' '+x.toUpperCase()[1]);
}

/**
 * Generates random UUID
 * @return {string} UUID
 */
export function randUUID() {
  const randChar = () => 'abcdef1234567890'[Math.floor(Math.random()*16)];
  return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, randChar);
}

/**
 * Debug
 */
export function debug() {
  const used = process.memoryUsage();
  let totalMem = 0;
  // eslint-disable-next-line guard-for-in
  for (const key in used) {
    totalMem += Math.round(used[key] / 1024 / 1024 * 100) / 100;
  }
  console.log('Total mem usage:', totalMem);
}

/**
 * Formats time
 * @param {number} time Time in seconds
 * @return {string} String time
 */
export function formatTime(time) {
  const flr = Math.floor;
  // Credits : https://github.com/EvanHahn/HumanizeDuration.js/blob/main/humanize-duration.js
  const words = {
    y: (c) => 'year' + (c === 1 ? '' : 's'),
    mo: (c) => 'month' + (c === 1 ? '' : 's'),
    w: (c) => 'week' + (c === 1 ? '' : 's'),
    d: (c) => 'day' + (c === 1 ? '' : 's'),
    h: (c) => 'hr' + (c === 1 ? '' : 's'),
    m: (c) => 'min' + (c === 1 ? '' : 's'),
    s: (c) => 'sec' + (c === 1 ? '' : 's'),
  };
  time = parseInt(time);

  let formatted = '';
  if (time / 31557600 >= 1) {
    formatted += ` ${flr(time / 31557600)} ${words.y(time / 31557600)}`;
    time %= 31557600;
  }
  if (time / 2629800 >= 1) {
    formatted += ` ${flr(time / 2629800)} ${words.mo(time / 2629800)}`;
    time %= 2629800;
  }
  if (time / 604800 >= 1) {
    formatted += ` ${flr(time / 604800)} ${words.w(time / 604800)}`;
    time %= 604800;
  }
  if (time / 86400 >= 1) {
    formatted += ` ${flr(time / 86400)} ${words.d(time / 86400)}`;
    time %= 86400;
  }
  if (time / 3600 >= 1) {
    formatted += ` ${flr(time / 3600)} ${words.h(time / 3600)}`;
    time %= 3600;
  }
  if (time / 60 >= 1) {
    formatted += ` ${flr(time / 60)} ${words.m(time / 60)}`;
    time %= 60;
  }
  formatted += ` ${flr(time)} ${words.s(time)}`;

  return formatted.slice(1);
}

/**
 * Formats number
 * @param {number} num Number
 * @return {string}
 */
export function formatNumber(num) {
  return num.toLocaleString('fr').replace(',', '.'); // For nice spacing, but decimal dots
}

/**
 * Formats IGN
 * @param {string} ign IGN
 * @param {string} [rank='Default'] Rank
 * @param {string} [guild] Guild tag if any
 * @return {string}
 */
export function formatIGN(ign, rank='Default', guild) {
  return `[${rank}] ${ign.replace(/_/g, '\\_')}${guild ? ` [${guild}]` : ''}`;
}

/**
 * @param {number} time Time
 * @param {Record<string, number>} stats Stats
 * @return {number|Record<string, number|boolean>}
 */
export function fixTime(time, stats) {
  if (time < 0) {
    time += 2**32;
    time /= 1000;
  };
  console.log(time);
  return time;
}

/**
 * Zips arrays
 * @param  {...any[]} arrays Arrays to zip
 * @return {Array<any>[]}
 */
export function zip(...arrays) {
  if (arrays.some((array) => !Array.isArray(array) || array.length !== arrays[0].length)) throw new Error('Bad args.');
  const zippedArray = [];
  for (let i = 0; i < arrays[0].length; i++ ) {
    zippedArray.push(arrays.map((arr)=>arr[i]));
  }
  return zippedArray;
}

export const srcPath = parse(new URL(import.meta.url).pathname).dir;

/**
 * @param {Record<string, number>} obj1 Object 1
 * @param {Record<string, number>} obj2 Object 2, must be more recent than Object 1
 * @param {Boolean} [safe=false] Loop through both objects' keys
 * @return {Record<string, number>} newObj
 */
export function deltaJson(obj1, obj2, safe=false) {
  const newObj = {};
  for (const key in obj2) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) continue;
    newObj[key] = Number(obj2[key]) - Number(obj1[key]) || 0;
  }
  if (!safe) return newObj;

  for (const key in obj1) {
    if (!Object.prototype.hasOwnProperty.call(obj1, key)) continue;
    newObj[key] = Number(obj2[key]) - Number(obj1[key]) || 0;
  }
  return newObj;
}

/**
 * Returns numbers of days in a month
 * @param {number} timestamp TS
 * @return {number}
 */
export function monthDays(timestamp) {
  const date = new Date(timestamp);
  const monthDate = new Date(new Date(date.getUTCFullYear(), (date.getUTCMonth()+1)%12, 1, 0, 0, 0, 0).getTime() - 1);
  return monthDate.getDate();
}
