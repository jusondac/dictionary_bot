const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { games } = require('../utils/wordchain');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-game')
    .setDescription('Leave the current word chain game (only works before game starts)'),
  name: 'leave-game',
  description: 'Leave the current word chain game (only works before game starts)',
  async execute(message, args) {
    const channelId = message.channel?.id;
    const userId = message.author?.id;

    if (!channelId || !userId) {
      await message.reply({ content: '❌ Unable to process request!', flags: MessageFlags.Ephemeral });
      return;
    }

    const game = games.get(channelId);
    if (!game) {
      await message.reply({ content: '❌ No word chain game is active in this channel!', flags: MessageFlags.Ephemeral });
      return;
    }

    if (game.gameState !== 'waiting') {
      await message.reply({ content: '❌ Cannot leave game once it has started!', flags: MessageFlags.Ephemeral });
      return;
    }

    const success = game.removePlayer(userId);
    if (success) {
      const username = message.author?.username || message.author?.displayName || 'Unknown';
      const embed = game.getGameEmbed();
      await message.reply({
        content: `👋 **${username}** left the game! (${game.players.size} players remaining)`,
        embeds: [embed]
      });

      // If no players left, clean up the game
      if (game.players.size === 0) {
        games.delete(channelId);
        await message.channel.send({ content: '🗑️ Game cancelled - no players remaining.' });
      }
    } else {
      await message.reply({ content: '❌ You are not in the game!', flags: MessageFlags.Ephemeral });
    }
  }
};
