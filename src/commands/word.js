const { SlashCommandBuilder } = require('discord.js');
const dictionaryAPI = require('../utils/dictionary');
const EmbedHelper = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('word')
    .setDescription('Get complete information about a word (definition, synonyms, antonyms)')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to get complete information about')
        .setRequired(true)),
  name: 'word',
  description: 'Get complete information about a word (definition, synonyms, antonyms)',
  async execute(message, args) {
    if (!args.length) {
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a word to get information about!\nUsage: `!word <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    const word = args.join(' ').toLowerCase();

    try {
      // Show typing indicator
      await message.channel.sendTyping();

      const wordData = await dictionaryAPI.getWordInfo(word);
      const embed = EmbedHelper.createDefinitionEmbed(wordData);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = EmbedHelper.createErrorEmbed(error.message);
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
