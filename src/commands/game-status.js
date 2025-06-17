const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { games } = require('../utils/wordchain');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game-status')
    .setDescription('Show the current word chain game status'),
  name: 'game-status',
  description: 'Show the current word chain game status',
  async execute(message, args) {
    const channelId = message.channel?.id;
    if (!channelId) {
      await message.reply({ content: '❌ This command can only be used in a server channel!', flags: MessageFlags.Ephemeral });
      return;
    }

    const game = games.get(channelId);
    if (!game) {
      await message.reply({ content: '❌ No word chain game is active in this channel!', flags: MessageFlags.Ephemeral });
      return;
    }

    const gameEmbed = game.getGameEmbed();

    if (game.gameState === 'playing') {
      const queueEmbed = game.getQueueEmbed();
      await message.reply({ embeds: [gameEmbed, queueEmbed] });
    } else {
      await message.reply({ embeds: [gameEmbed] });
    }
  }
};
