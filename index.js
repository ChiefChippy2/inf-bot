import path from 'path';
const correctDir = path.parse(new URL(import.meta.url).pathname).dir;
if (correctDir !== process.cwd()) {
  process.chdir(correctDir);
  console.warn(`Changed CWD.`);
};
import('./src/index.js');
