/* eslint-disable require-jsdoc */
// This is only necessary if the database structure has received an update.
// console.log('Starting to alter database... this might take a while. Please do not interrupt this process or bad things will happen.');
// process.env.ENV = 'DEV';
// import {sequelize} from '../database/index.js';

// await sequelize.sync({
//   alter: true,
// });
// console.log('Update done.');
// process.exit();

// SPECIAL UPDATE : (migration from daily to multi-periodic)
import {Sequelize, Model, DataTypes} from 'sequelize';
import {writeFile, readFile, unlink} from 'fs/promises';
import {srcPath} from '../utils.js';
import {updateLinkUserStats} from '../stats/periodicstats.js';

const dbPath = `${srcPath}/../storage/`;

// First and for all: backup
await writeFile(`${dbPath}player.db.save`, await readFile(`${dbPath}player.db`));

const oldSequelize = new Sequelize(`sqlite:${srcPath}/../storage/player.db`, {logging: process.env.ENV === 'DEV' ? console.log: false});

// Old Models

class UserStats extends Model {}
UserStats.init({
  mcUuid: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  stats: {
    type: DataTypes.STRING, // can be json
    allowNull: false,
  },
  storeTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {sequelize: oldSequelize});
class LinkedUser extends Model {}
LinkedUser.init({
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  mcUuid: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  linkmethod: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }, // could be tinyint, but it's not that important. 0 -> manual/unknown; 1 -> API friend; 2 -> OAuth
  linkedAt: DataTypes.DATE,
  ip: DataTypes.STRING,
  updateDailyStatsTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }, // based on UTC Hour (0 to 23)
  statsLastUpdated: {
    type: DataTypes.DATE,
  },
}, {sequelize: oldSequelize});
await oldSequelize.sync();
const userData = await UserStats.findAll();
const durableUserData = userData.map((x)=>x.toJSON());
const userLinkData = await LinkedUser.findAll();
const durableUserLinkData = userLinkData.map((x)=>x.toJSON());

await oldSequelize.close();

await (async ()=>{
  const newSequelize = new Sequelize(`sqlite:${srcPath}/../storage/player.db.new`, {logging: process.env.ENV === 'DEV' ? console.log: false});

  class LinkedUser extends Model {}
  LinkedUser.init({
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mcUuid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    linkmethod: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }, // could be tinyint, but it's not that important. 0 -> manual/unknown; 1 -> API friend; 2 -> OAuth
    linkedAt: DataTypes.DATE,
    ip: DataTypes.STRING,
    updateDailyStatsTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }, // based on UTC Hour (0 to 23)
    statsLastUpdated: {
      type: DataTypes.DATE,
    },
  }, {sequelize: newSequelize});

  class UserStats extends Model {}
  UserStats.init({
    mcUuid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    stats: {
      type: DataTypes.STRING, // can be json
      allowNull: false,
    },
    storeTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    computedUniqueKey: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
  }, {sequelize: newSequelize});
  await newSequelize.sync();

  // Populate linkedUser data
  const modifiedDurableUserLinkData = [];
  for (const data of durableUserLinkData) {
    modifiedDurableUserLinkData.push({...data, updateDailyStatsTime: (24 - data.updateDailyStatsTime) % 24});
  }

  await LinkedUser.bulkCreate(modifiedDurableUserLinkData);
  const modifiedDurableUserData = [];
  for (const data of durableUserData) {
    modifiedDurableUserData.push({...data, type: 'DAILY', computedUniqueKey: `${data.mcUuid}-DAILY`});
    modifiedDurableUserData.push({...data, type: 'WEEKLY', computedUniqueKey: `${data.mcUuid}-WEEKLY`});
    modifiedDurableUserData.push({...data, type: 'MONTHLY', computedUniqueKey: `${data.mcUuid}-MONTHLY`});
  }

  await UserStats.bulkCreate(modifiedDurableUserData);
  await newSequelize.close();
})();

await writeFile(`${dbPath}/player.db`, await readFile(`${dbPath}/player.db.new`));
await unlink(`${dbPath}/player.db.new`);

// Update everyone's stats
await (async ()=>{
  const newSequelize = new Sequelize(`sqlite:${srcPath}/../storage/player.db`, {logging: process.env.ENV === 'DEV' ? console.log: false});

  class LinkedUser extends Model {}
  LinkedUser.init({
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mcUuid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    linkmethod: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }, // could be tinyint, but it's not that important. 0 -> manual/unknown; 1 -> API friend; 2 -> OAuth
    linkedAt: DataTypes.DATE,
    ip: DataTypes.STRING,
    updateDailyStatsTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }, // based on UTC Hour (0 to 23)
    statsLastUpdated: {
      type: DataTypes.DATE,
    },
  }, {sequelize: newSequelize});

  class UserStats extends Model {}
  UserStats.init({
    mcUuid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    stats: {
      type: DataTypes.STRING, // can be json
      allowNull: false,
    },
    storeTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    computedUniqueKey: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
  }, {sequelize: newSequelize});
  await newSequelize.sync();
  const users = await LinkedUser.findAll();
  await Promise.all(users.map((x)=>[updateLinkUserStats(x, 'DAILY'), updateLinkUserStats(x, 'WEEKLY'), updateLinkUserStats(x, 'MONTHLY')]).flat());
});

process.exit();
