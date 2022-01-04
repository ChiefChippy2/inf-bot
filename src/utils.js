/**
 * Wait
 * @param {number} timeout Timeout in ms
 * @return {void}
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
  // eslint-disable-next-line guard-for-in
  for (const key in used) {
    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}
