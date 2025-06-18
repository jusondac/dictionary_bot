const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const dictionaryAPI = require('../utils/dictionary');
const EmbedHelper = require('../utils/embed');
const { games } = require('../utils/wordchain');
const { startTurnTimer } = require('./start-wordchain');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('word')
    .setDescription('Submit a word for word chain game or get word information')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to submit or look up')
        .setRequired(true)),
  name: 'word',
  description: 'Submit a word for word chain game or get word information',
  async execute(message, args) {
    // Get word from either slash command options or args (for prefix commands)
    let word;
    if (message.options && message.options.getString) {
      // Slash command
      word = message.options.getString('word');
    } else if (args.length > 0) {
      // Prefix command
      word = args.join(' ');
    }

    if (!word) {
      const errorEmbed = EmbedHelper.createErrorEmbed('Please provide a word!\nUsage: `/word <word>` or `!word <word>`');
      return message.reply({ embeds: [errorEmbed] });
    }

    word = word.toLowerCase().trim();
    const channelId = message.channel?.id;
    const userId = message.author?.id;

    // Check if there's an active word chain game first
    const game = games.get(channelId);
    // console.log(`🎮 Word command - Channel: ${channelId}, Word: "${word}", Game State: ${game?.gameState || 'no game'}, User: ${userId}`);

    if (game && game.gameState === 'playing') {
      // This is a word chain game submission
      const result = await game.submitWord(word, userId);
      // console.log(`🎯 Word submission result:`, result);

      if (result.success) {
        // Word was accepted
        const gameEmbed = game.getGameEmbed();
        const queueEmbed = game.getQueueEmbed();

        await message.reply({
          content: `✅ **${word.toUpperCase()}** accepted! (+${result.points} points)`,
          embeds: [gameEmbed, queueEmbed]
        });

        // Start timer for next turn
        startTurnTimer(game, message.channel);

      } else {
        // Word was rejected
        await message.reply({ content: `❌ ${result.reason}`, flags: MessageFlags.Ephemeral });
      }
      return;
    }

    // No active game, treat as dictionary lookup
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
