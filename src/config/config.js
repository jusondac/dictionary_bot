require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.BOT_PREFIX || '!',
  dictionaryApiKey: process.env.DICTIONARY_API_KEY,
  wordsApiKey: process.env.WORDS_API_KEY,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID
};
