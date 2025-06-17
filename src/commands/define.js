const { SlashCommandBuilder } = require('discord.js');
const dictionaryAPI = require('../utils/dictionary');
const EmbedHelper = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Get the definition of a word')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to define')
        .setRequired(true)),
  name: 'define',
  description: 'Get the definition of a word',
  async execute(message, args) {
    if (!args.length) {
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a word to define!\nUsage: `!define <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    const word = args.join(' ').toLowerCase();

    try {
      // Show typing indicator
      await message.channel.sendTyping();

      const wordData = await dictionaryAPI.getDefinition(word);
      const embed = EmbedHelper.createDefinitionEmbed(wordData);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = EmbedHelper.createErrorEmbed(error.message);
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
