const { SlashCommandBuilder } = require('discord.js');
const dictionaryAPI = require('../utils/dictionary');
const EmbedHelper = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antonyms')
    .setDescription('Get antonyms for a word')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to find antonyms for')
        .setRequired(true)),
  name: 'antonyms',
  description: 'Get antonyms for a word',
  async execute(message, args) {
    if (!args.length) {
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a word to find antonyms for!\nUsage: `!antonyms <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    const word = args.join(' ').toLowerCase();

    try {
      // Show typing indicator
      await message.channel.sendTyping();

      const antonymData = await dictionaryAPI.getAntonyms(word);
      const embed = EmbedHelper.createAntonymsEmbed(word, antonymData.antonyms);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = EmbedHelper.createErrorEmbed(error.message);
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
