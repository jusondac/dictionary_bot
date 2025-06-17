const { SlashCommandBuilder } = require('discord.js');
const EmbedHelper = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  name: 'help',
  description: 'Show all available commands',
  async execute(message, args) {
    const embed = EmbedHelper.createHelpEmbed();
    await message.reply({ embeds: [embed] });
  }
};
