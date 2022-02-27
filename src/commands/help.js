/* eslint-disable max-len */
/**
 * @typedef {import('discord.js').CommandInteraction} Interaction
 */

import {DefaultEmbed} from '../constants.js';

export default {
  'name': 'help',
  'description': 'Help command',
  'dynamic': false,
  /**
   * handler
   * @param {Interaction} interaction
   */
  'handler': async (interaction) => {
    const embeds = [new DefaultEmbed(interaction.guild?.me || interaction.client)
        .setTitle('Help page')
        .setDescription('***')
        .addField('General Usage - How to?', `Using the bot is very simple :
This bot is entirely built with slash commands, which means all commands start with a \`/\`, and ones that are available for you to use are visible in a list that will automatically pop up when you enter \`/\`. You can then proceed to select or type the command you would like to use, and you will need to provide any further information that is asked by the interface (for example, the IGN of the player). Some options require text input, while others can be selected from a list. There can also be optional choices that you don't necessarily have to put. If everything goes well, the bot will respond.`)
        .addField('Privacy terms: ', `We only log your discord tag (username#1234) when you use an interaction (this includes pressing a button, using a selection menu, using one of the bot's slash commands) to prevent eventual abuse and to help debugging in case the bot crashes.
If you used \`/link\` and linked your account to your discord account, we will store your discord ID, corresponding minecraft UUID, and daily stats in Murder Mystery (only 1 copy will be saved every day). To remove your data from the bot database, feel free to contact the bot owner.
As to the permissions the bot requires : I, as the author of the bot, judge them to be the minimum necessary for the bot to function correctly (or will be required for the bot to function correctly in a future update). You can remove some permissions from the bot, but be warned that it might result in some features breaking.
As to what the bot receives from discord : Only some guild information and in case of an interaction, user data accessible by any normal user in the same guild.`)
        .addField('FAQ', '__To be written__')];
    await interaction.reply({embeds});
  },
};
