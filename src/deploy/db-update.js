/* eslint-disable require-jsdoc */
// This is only necessary if the database structure has received an update.
console.log('Starting to alter database... this might take a while. Please do not interrupt this process or bad things will happen.');
process.env.ENV = 'DEV';
import {sequelize} from '../database/index.js';

await sequelize.sync({
  alter: true,
});
console.log('Update done.');
process.exit();
