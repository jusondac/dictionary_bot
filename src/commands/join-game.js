const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { games } = require('../utils/wordchain');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join-game')
    .setDescription('Join the current word chain game'),
  name: 'join-game',
  description: 'Join the current word chain game',
  async execute(message, args) {
    const channelId = message.channel?.id;
    if (!channelId) {
      await message.reply({ content: '❌ This command can only be used in a server channel!', flags: MessageFlags.Ephemeral });
      return;
    }

    // Check if there's a game in this channel
    const game = games.get(channelId);
    if (!game) {
      await message.reply({ content: '❌ No word chain game is currently active in this channel! Use `/start-wordchain` to start one.', flags: MessageFlags.Ephemeral });
      return;
    }

    // Check if game is in waiting state
    if (game.gameState !== 'waiting') {
      if (game.gameState === 'playing') {
        await message.reply({ content: '❌ The game has already started! Wait for the next game.', flags: MessageFlags.Ephemeral });
      } else {
        await message.reply({ content: '❌ Cannot join game at this time.', flags: MessageFlags.Ephemeral });
      }
      return;
    }

    const userId = message.author?.id;
    const username = message.author?.username || message.author?.displayName || 'Unknown';

    if (!userId) {
      await message.reply({ content: '❌ Unable to identify user!', flags: MessageFlags.Ephemeral });
      return;
    }

    // Try to add player
    const success = game.addPlayer(userId, username);

    if (success) {
      const embed = game.getGameEmbed();
      await message.reply({
        content: `✅ **${username}** joined the game! (${game.players.size} players)`
      });

      // Auto-start if we have enough players and some time has passed
      if (game.players.size >= 2) {
        // Optional: You could add a shorter countdown here if desired
        // For now, we'll let the original 20-second timer from start-wordchain handle it
      }
    } else {
      await message.reply({ content: '❌ You are already in the game!', flags: MessageFlags.Ephemeral });
    }
  }
};
