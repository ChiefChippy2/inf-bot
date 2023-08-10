/* eslint-disable require-jsdoc */
import {Sequelize, Model, DataTypes} from 'sequelize';
import {srcPath} from '../utils.js';

export const sequelize = new Sequelize(`sqlite:${srcPath}/../storage/player.db`, {logging: process.env.ENV === 'DEV' ? console.log: false});

export class LinkedUser extends Model {}
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
  nickname: {
    type: DataTypes.STRING,
    defaultValue: 'main',
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
}, {sequelize});

export class LinkedAlts extends Model {}
LinkedAlts.init({
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
  nickname: {
    type: DataTypes.STRING,
    allowNull: true, // TBD
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
}, {sequelize});

export class UserStats extends Model {}
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
}, {sequelize});

await sequelize.authenticate();
await sequelize.sync();

