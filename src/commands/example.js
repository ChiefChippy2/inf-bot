/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

export default {
  'name': 'Name of cmd',
  'description': 'Description',
  'options': [
    {
      'type': 3,
      'name': 'title',
      'description': 'This is the description',
      'choices': [
        {
          'name': 'Choice 1',
          'value': 'this is choice 1',
        },
      ],
      'required': true,
    },
    {
      'type': 4,
      'name': 'intoption',
      'description': 'integer option',
      'required': true,
    },
  ],
  // If command is dynamic (has options that might change per restart)
  'dynamic': false,
  // Will be called for dynamic deploy
  'deploy': () => {},
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    // Code here...
  },
};
