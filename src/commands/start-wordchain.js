const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { WordChainGame, games } = require('../utils/wordchain');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-wordchain')
    .setDescription('Start a new word chain game'),
  name: 'start-wordchain',
  description: 'Start a new word chain game',
  async execute(message, args) {
    const channelId = message.channel?.id;
    if (!channelId) {
      await message.reply({ content: '❌ This command can only be used in a server channel!', flags: MessageFlags.Ephemeral });
      return;
    }

    // Check if there's already a game in this channel
    if (games.has(channelId)) {
      const existingGame = games.get(channelId);
      if (existingGame.gameState === 'playing') {
        await message.reply({ content: '❌ There is already a word chain game in progress in this channel!', flags: MessageFlags.Ephemeral });
        return;
      } else if (existingGame.gameState === 'waiting') {
        await message.reply({ content: '❌ There is already a word chain game waiting for players in this channel!', flags: MessageFlags.Ephemeral });
        return;
      }
    }

    // Create new game
    const game = new WordChainGame(channelId);
    games.set(channelId, game);

    // Add the user who started the game
    const userId = message.author?.id;
    const username = message.author?.username || message.author?.displayName || 'Unknown';

    if (userId) {
      game.addPlayer(userId, username);
    }

    // Send initial game embed
    const embed = game.getGameEmbed();
    await message.reply({
      content: '🎮 **Word Chain Game Starting!**\n\n⏰ Players have **20 seconds** to join using `/join-game`\n🎯 Game will start automatically when enough players join!',
      embeds: [embed]
    });

    // Auto-start countdown after 20 seconds
    setTimeout(async () => {
      if (games.get(channelId) === game && game.gameState === 'waiting') {
        if (game.players.size >= 2) {
          // Start the game
          const gameEndCallback = async () => {
            try {
              const endEmbed = game.getGameEmbed();
              await message.channel.send({
                content: '⏰ **Time\'s Up!** The word chain game has ended!',
                embeds: [endEmbed]
              });

              // Clean up the game from the games map after 30 seconds
              setTimeout(() => {
                games.delete(channelId);
              }, 30000);
            } catch (error) {
              console.error('Error sending game end message:', error);
            }
          };

          if (game.startGame(gameEndCallback)) {
            const gameEmbed = game.getGameEmbed();
            const queueEmbed = game.getQueueEmbed();

            try {
              await message.channel.send({
                content: '🚀 **Game Started!** Let the word chain begin!',
                embeds: [gameEmbed, queueEmbed]
              });

              // Start turn timer
              startTurnTimer(game, message.channel);
            } catch (error) {
              console.error('Error starting game:', error);
            }
          }
        } else {
          // Not enough players
          games.delete(channelId);
          try {
            await message.channel.send({
              content: '❌ **Game Cancelled** - Not enough players joined! (Need at least 2 players)'
            });
          } catch (error) {
            console.error('Error sending cancellation message:', error);
          }
        }
      }
    }, 20000);
  }
};

// Helper function to manage turn timers
function startTurnTimer(game, channel) {
  if (game.gameState !== 'playing') return;

  // Clear existing turn timeout
  if (game.turnTimeout) {
    clearTimeout(game.turnTimeout);
  }

  // Set 40-second turn timeout
  game.turnTimeout = setTimeout(async () => {
    if (game.gameState === 'playing') {
      const currentPlayer = game.getCurrentPlayer();
      if (currentPlayer) {
        try {
          await channel.send(`⏰ **Time's up!** ${currentPlayer.username} was skipped for taking too long.`);
        } catch (error) {
          console.error('Error sending skip message:', error);
        }
      }

      game.skipCurrentPlayer();

      // Check if game should continue
      if (game.gameState === 'playing') {
        const gameEmbed = game.getGameEmbed();
        const queueEmbed = game.getQueueEmbed();

        try {
          await channel.send({
            content: `🔄 **Next turn!**`,
            embeds: [gameEmbed, queueEmbed]
          });
        } catch (error) {
          console.error('Error sending next turn message:', error);
        }

        // Start next turn timer
        startTurnTimer(game, channel);
      }
    }
  }, 40000);
}

// Export the helper function for use in other commands
module.exports.startTurnTimer = startTurnTimer;
