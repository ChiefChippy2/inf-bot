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
  return str.replace(/(^|_)./g, (x)=>x.toUpperCase());
}
