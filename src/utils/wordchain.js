const { EmbedBuilder } = require('discord.js');

// Letter point values based on rarity
const LETTER_POINTS = {
  'a': 1, 'b': 3, 'c': 3, 'd': 2, 'e': 1, 'f': 4, 'g': 2, 'h': 4, 'i': 1, 'j': 8,
  'k': 5, 'l': 1, 'm': 3, 'n': 1, 'o': 1, 'p': 3, 'q': 10, 'r': 1, 's': 1, 't': 1,
  'u': 1, 'v': 4, 'w': 4, 'x': 8, 'y': 4, 'z': 10
};

// Starting words for the game
const STARTING_WORDS = [
  'apple', 'elephant', 'tiger', 'rabbit', 'orange', 'unicorn', 'dragon', 'phoenix',
  'butterfly', 'mountain', 'ocean', 'forest', 'castle', 'garden', 'rainbow', 'thunder',
  'whisper', 'crystal', 'mystery', 'adventure', 'treasure', 'journey', 'sunset', 'melody'
];

class WordChainGame {
  constructor(channelId) {
    this.channelId = channelId;
    this.players = new Map(); // Map of userId -> { username, score, words }
    this.currentPlayerIndex = 0;
    this.currentWord = '';
    this.usedWords = new Set();
    this.gameState = 'waiting'; // waiting, countdown, playing, ended
    this.gameStartTime = null;
    this.turnStartTime = null;
    this.turnTimeout = null;
    this.gameTimeout = null;
    this.skipTimeout = null;
  }

  addPlayer(userId, username) {
    if (this.gameState !== 'waiting') {
      return false;
    }

    if (!this.players.has(userId)) {
      this.players.set(userId, {
        username: username,
        score: 0,
        words: []
      });
      return true;
    }
    return false;
  }

  removePlayer(userId) {
    if (this.gameState === 'waiting') {
      return this.players.delete(userId);
    }
    return false;
  }

  getPlayersList() {
    return Array.from(this.players.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  getCurrentPlayer() {
    const playersList = this.getPlayersList();
    if (playersList.length === 0) return null;
    return playersList[this.currentPlayerIndex];
  }

  nextPlayer() {
    const playersList = this.getPlayersList();
    if (playersList.length > 0) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % playersList.length;
    }
  }

  startGame(endCallback = null) {
    if (this.players.size < 2) {
      return false;
    }

    this.gameState = 'playing';
    this.gameStartTime = Date.now();
    this.currentWord = STARTING_WORDS[Math.floor(Math.random() * STARTING_WORDS.length)];
    this.usedWords.add(this.currentWord.toLowerCase());
    this.currentPlayerIndex = 0;
    this.turnStartTime = Date.now();

    // Set game timeout (2 minutes)
    this.gameTimeout = setTimeout(() => {
      if (this.gameState === 'playing') {
        this.endGame();
        if (endCallback) {
          endCallback();
        }
      }
    }, 2 * 60 * 1000);

    return true;
  }

  isValidWord(word, userId) {
    const normalizedWord = word.toLowerCase().trim();

    // Check if word starts with the last letter of current word
    const lastLetter = this.currentWord.slice(-1).toLowerCase();
    const firstLetter = normalizedWord.charAt(0);

    if (firstLetter !== lastLetter) {
      return { valid: false, reason: `Word must start with "${lastLetter.toUpperCase()}"` };
    }

    // Check if word was already used
    if (this.usedWords.has(normalizedWord)) {
      return { valid: false, reason: 'This word has already been used!' };
    }

    // Check if it's a valid word (basic validation - contains only letters)
    if (!/^[a-zA-Z]+$/.test(normalizedWord)) {
      return { valid: false, reason: 'Word must contain only letters!' };
    }

    // Check if word is at least 2 characters long
    if (normalizedWord.length < 2) {
      return { valid: false, reason: 'Word must be at least 2 characters long!' };
    }

    return { valid: true };
  }

  submitWord(word, userId) {
    // console.log(`🔍 submitWord called - word: "${word}", userId: ${userId}`);

    const currentPlayer = this.getCurrentPlayer();
    // console.log(`🎯 Current player:`, currentPlayer);

    if (!currentPlayer || currentPlayer.userId !== userId) {
      // console.log(`❌ Not player's turn - current: ${currentPlayer?.userId}, submitted: ${userId}`);
      return { success: false, reason: 'Not your turn!' };
    }

    const validation = this.isValidWord(word, userId);
    // console.log(`✅ Word validation:`, validation);

    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const normalizedWord = word.toLowerCase().trim();

    // Calculate points for the word
    const points = this.calculateWordPoints(normalizedWord);

    // Update player data
    const player = this.players.get(userId);
    player.score += points;
    player.words.push(normalizedWord);

    // Update game state
    this.currentWord = normalizedWord;
    this.usedWords.add(normalizedWord);
    this.nextPlayer();
    this.turnStartTime = Date.now();

    return { success: true, points };
  }

  calculateWordPoints(word) {
    let points = 0;
    for (const letter of word.toLowerCase()) {
      points += LETTER_POINTS[letter] || 1;
    }
    return points;
  }

  skipCurrentPlayer() {
    this.nextPlayer();
    this.turnStartTime = Date.now();
  }

  endGame() {
    this.gameState = 'ended';

    // Clear all timeouts
    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
    }
    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }
    if (this.skipTimeout) {
      clearTimeout(this.skipTimeout);
    }

    return this.getGameEmbed();
  }

  getGameEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTimestamp();

    if (this.gameState === 'waiting') {
      embed.setTitle('🔤 Word Chain Game - Waiting for Players')
        .setDescription('Use `/join-game` to join the game!\n\n**How to play:**\n• Make a word that starts with the last letter of the previous word\n• You have 20 seconds per turn\n• Each letter has points based on rarity (Z=10, Q=10, A=1, etc.)\n• Game lasts 2 minutes')
        .addFields({
          name: '👥 Players',
          value: this.players.size > 0 ?
            this.getPlayersList().map(p => `• ${p.username}`).join('\n') :
            'No players yet',
          inline: false
        });
    } else if (this.gameState === 'playing') {
      const currentPlayer = this.getCurrentPlayer();
      const timeElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
      const timeRemaining = Math.max(0, 120 - timeElapsed);
      const turnTimeElapsed = Math.floor((Date.now() - this.turnStartTime) / 1000);
      const turnTimeRemaining = Math.max(0, 20 - turnTimeElapsed);

      embed.setTitle('🔤 Word Chain Game - In Progress')
        .setDescription(`**Current Word:** \`${this.currentWord.toUpperCase()}\`\n**Next word must start with: \`${this.currentWord.slice(-1).toUpperCase()}\`**`)
        .addFields(
          {
            name: '⏰ Time Remaining',
            value: `Game: ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}\nTurn: ${turnTimeRemaining}s`,
            inline: true
          },
          {
            name: '🎯 Current Turn',
            value: currentPlayer ? `${currentPlayer.username}` : 'Unknown',
            inline: true
          },
          {
            name: '📊 Scores',
            value: this.getPlayersList()
              .sort((a, b) => b.score - a.score)
              .map(p => `${p.username}: ${p.score} pts`)
              .join('\n') || 'No scores yet',
            inline: false
          }
        );
    } else if (this.gameState === 'ended') {
      const winners = this.getPlayersList().sort((a, b) => b.score - a.score);

      embed.setTitle('🏆 Word Chain Game - Results')
        .setDescription('Game finished!')
        .addFields({
          name: '🥇 Final Scores',
          value: winners.map((p, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
            return `${medal} ${p.username}: ${p.score} points (${p.words.length} words)`;
          }).join('\n') || 'No players',
          inline: false
        });

      if (winners.length > 0 && winners[0].words.length > 0) {
        embed.addFields({
          name: '📝 Words Used',
          value: winners[0].words.slice(0, 10).join(', ') + (winners[0].words.length > 10 ? '...' : ''),
          inline: false
        });
      }
    }

    return embed;
  }

  getQueueEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('📋 Turn Queue')
      .setTimestamp();

    if (this.gameState === 'playing') {
      const playersList = this.getPlayersList();
      const queueText = playersList.map((p, i) => {
        const indicator = i === this.currentPlayerIndex ? '▶️' : '⏸️';
        return `${indicator} ${p.username} (${p.score} pts)`;
      }).join('\n');

      embed.setDescription(queueText || 'No players in queue');
    } else {
      embed.setDescription('Game is not currently active');
    }

    return embed;
  }
}

// Global game instances by channel
const games = new Map();

module.exports = {
  WordChainGame,
  games,
  LETTER_POINTS
};
