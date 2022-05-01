/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {periodicStats} from './_basePeriodicStatsHandler.js';

export default {
  'name': 'weeklystats',
  'description': '[BETA] Shows your weekly stats (only for LINKED users)!',
  'options': [],
  /**
    * handler
    * @param {Interaction} interaction
    */
  'handler': async (interaction) => {
    return await periodicStats(interaction, 'WEEKLY');
  },
};

