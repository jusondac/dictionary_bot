const { SlashCommandBuilder } = require('discord.js');
const dictionaryAPI = require('../utils/dictionary');
const EmbedHelper = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('synonyms')
    .setDescription('Get synonyms for a word')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to find synonyms for')
        .setRequired(true)),
  name: 'synonyms',
  description: 'Get synonyms for a word',
  async execute(message, args) {
    // Handle both slash commands and regular messages
    let word;
    
    if (args && args.length > 0) {
      // Regular message command
      word = args.join(' ').toLowerCase();
    } else {
      // This shouldn't happen with proper slash command setup, but as fallback
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a word to find synonyms for!\nUsage: `/synonyms <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    if (!word || word.trim() === '') {
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a valid word to find synonyms for!\nUsage: `/synonyms <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    try {
      // Show typing indicator
      await message.channel.sendTyping();

      const synonymData = await dictionaryAPI.getSynonyms(word);
      const embed = EmbedHelper.createSynonymsEmbed(word, synonymData.synonyms);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Synonyms command error:', error);
      const errorEmbed = EmbedHelper.createErrorEmbed(error.message);
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
