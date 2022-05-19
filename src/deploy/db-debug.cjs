/**
 * Load me into node REPL!
 */


(async ()=>{
  const db = await import('../database/index.js');
  const fs = await import('fs/promises');
  const {srcPath} = await import('../utils.js');
  module.exports = {

    db,
    fs,
    srcPath,
    /**
     * Backs up database
     */
    async backupDB() {
      await fs.copyFile(`${srcPath}/../storage/player.db`, `${srcPath}/../storage/player-${process.pid}.db.save`);
      console.log(`SUCCESS, backup file at ${srcPath}/../storage/player-${process.pid}.db.save`);
    },

  };
  global.debugTools = module.exports;
})();
