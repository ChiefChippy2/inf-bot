/* eslint-disable require-jsdoc */
import {Sequelize, Model, DataTypes} from 'sequelize';
import {srcPath} from '../utils.js';

export const sequelize = new Sequelize(`sqlite:${srcPath}/../storage/player.db`, {logging: process.env.ENV === 'DEV'});

export class LinkedUser extends Model {}
LinkedUser.init({
  discordId: {
    type: DataTypes.BIGINT,
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
}, {sequelize});


await sequelize.authenticate();
await sequelize.sync();

