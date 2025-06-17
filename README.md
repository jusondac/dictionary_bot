# Discord Dictionary Bot 📚

A powerful Discord bot that provides dictionary functions including definitions, synonyms, and antonyms for words.

## Features

- 📖 **Word Definitions** - Get detailed definitions with pronunciation and examples
- 🔗 **Synonyms** - Find words with similar meanings
- 🔀 **Antonyms** - Find words with opposite meanings
- 📋 **Complete Word Info** - Get all information about a word in one command
- 🎨 **Beautiful Embeds** - Clean and organized message formatting
- ⚡ **Fast Responses** - Quick API calls with fallback options

## Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!define <word>` | Get the definition of a word | `!define beautiful` |
| `!synonyms <word>` | Get synonyms for a word | `!synonyms happy` |
| `!antonyms <word>` | Get antonyms for a word | `!antonyms good` |
| `!word <word>` | Get complete word information | `!word excellent` |
| `!help` | Show all available commands | `!help` |

## Setup Instructions

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 16.9.0 or higher)
- A Discord account
- Discord Developer Application

### 2. Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the bot token (you'll need this for the `.env` file)
6. Under "Privileged Gateway Intents", enable:
   - Message Content Intent

### 3. Bot Permissions

When inviting the bot to your server, make sure it has these permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History

### 4. Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy the `.env` file and add your tokens:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file with your actual tokens:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   WORDS_API_KEY=your_words_api_key_here (optional)
   BOT_PREFIX=!
   ```

### 5. Getting API Keys (Optional)

The bot works with free APIs, but for enhanced features you can get:

#### WordsAPI (for better synonyms/antonyms):
1. Go to [RapidAPI WordsAPI](https://rapidapi.com/dpventures/api/wordsapi)
2. Subscribe to the free plan
3. Copy your API key to the `.env` file

### 6. Running the Bot

#### Development mode (with auto-restart):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

### 7. Invite the Bot to Your Server

1. Go to the Discord Developer Portal
2. Select your application
3. Go to "OAuth2" > "URL Generator"
4. Select scopes: `bot`
5. Select permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
6. Copy the generated URL and open it in your browser
7. Select your server and authorize the bot

## API Information

### Primary APIs Used:

1. **Free Dictionary API** (No key required)
   - URL: `https://api.dictionaryapi.dev`
   - Provides: Definitions, phonetics, examples
   - Rate limit: No strict limits

2. **WordsAPI** (Optional, requires RapidAPI key)
   - URL: `https://wordsapiv1.p.rapidapi.com`
   - Provides: Enhanced synonyms, antonyms, more detailed word data
   - Rate limit: 2500 requests/day (free tier)

## Project Structure

```
discord-dictionary-bot/
├── src/
│   ├── commands/          # Bot commands
│   │   ├── define.js
│   │   ├── synonyms.js
│   │   ├── antonyms.js
│   │   ├── word.js
│   │   └── help.js
│   ├── utils/             # Utility functions
│   │   ├── dictionary.js  # API handling
│   │   └── embed.js       # Discord embed creation
│   ├── config/            # Configuration
│   │   └── config.js
│   └── index.js           # Main bot file
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Troubleshooting

### Common Issues:

1. **Bot doesn't respond**
   - Check if the bot is online in your server
   - Verify the bot has "Send Messages" permission
   - Make sure you're using the correct prefix (`!` by default)

2. **"No definition found" errors**
   - Some words might not be in the dictionary API
   - Try alternative spellings or simpler words
   - The API works best with common English words

3. **API rate limits**
   - The free APIs have rate limits
   - If using WordsAPI, check your RapidAPI dashboard for usage
   - Consider upgrading to paid plans for heavy usage

### Error Messages:

- `DISCORD_TOKEN is required` - Add your bot token to the `.env` file
- `Could not find definition` - Word not found in the dictionary
- `WordsAPI key not configured` - Add your WordsAPI key for enhanced features

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you need help:
1. Check this README for common solutions
2. Look at the error messages in your console
3. Verify all environment variables are set correctly
4. Make sure the bot has proper permissions in your Discord server

## Changelog

### v1.0.0
- Initial release
- Basic dictionary functionality
- Support for definitions, synonyms, and antonyms
- Beautiful Discord embeds
- Error handling and user feedback
