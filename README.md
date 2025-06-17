# Discord Dictionary Bot 📚

A powerful Discord bot that provides dictionary functions including definitions, synonyms, antonyms, and an interactive word chain game.

## Features

- 📖 **Word Definitions** - Get detailed definitions with pronunciation and examples
- 🔗 **Synonyms** - Find words with similar meanings
- 🔀 **Antonyms** - Find words with opposite meanings
- 📋 **Complete Word Info** - Get all information about a word in one command
- 🎮 **Word Chain Game** - Interactive multiplayer word game with dictionary validation
- 🎨 **Beautiful Embeds** - Clean and organized message formatting
- ⚡ **Fast Responses** - Quick API calls with fallback options

## Commands

### Dictionary Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!define <word>` | Get the definition of a word | `!define beautiful` |
| `!synonyms <word>` | Get synonyms for a word | `!synonyms happy` |
| `!antonyms <word>` | Get antonyms for a word | `!antonyms good` |
| `!word <word>` | Get complete word information | `!word excellent` |
| `!help` | Show all available commands | `!help` |

### Word Chain Game Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/start-wordchain` | Start a new word chain game | `/start-wordchain` |
| `/join-game` | Join an existing word chain game | `/join-game` |
| `/leave-game` | Leave the current word chain game | `/leave-game` |
| `/word <word>` | Submit a word during the game | `/word apple` |
| `/game-status` | Check current game status and scores | `/game-status` |

## Word Chain Game 🎮

The Word Chain Game is an interactive multiplayer game where players take turns creating a chain of words.

### How to Play:

1. **Start a Game**: Use `/start-wordchain` to create a new game
2. **Join Players**: Other players use `/join-game` to participate (minimum 2 players)
3. **Game Rules**:
   - Each word must start with the last letter of the previous word
   - Words must be valid English words (verified using dictionary API)
   - Words cannot be repeated
   - Minimum 2 characters per word
   - Only letters allowed (no numbers or special characters)
4. **Scoring**: Points awarded based on letter rarity (A=1, Z=10, etc.)
5. **Time Limits**: 40 seconds per turn, 5 minutes total game time

### Game Features:

- **Dictionary Validation**: All submitted words are verified against the English dictionary
- **Real-time Scoring**: Live scoreboard with point tracking
- **Turn Management**: Automatic player rotation with timeout handling
- **Game Analytics**: Track words used and player statistics

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

### 6. Bot Permissions

When inviting the bot to your server, make sure it has these permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History
- Manage Messages (for game management)

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
│   │   ├── define.js      # Dictionary definition command
│   │   ├── synonyms.js    # Synonyms command
│   │   ├── antonyms.js    # Antonyms command
│   │   ├── word.js        # Complete word info command
│   │   ├── help.js        # Help command
│   │   ├── start-wordchain.js  # Start word chain game
│   │   ├── join-game.js   # Join word chain game
│   │   ├── leave-game.js  # Leave word chain game
│   │   └── game-status.js # Check game status
│   ├── utils/             # Utility functions
│   │   ├── dictionary.js  # Dictionary API handling
│   │   ├── wordchain.js   # Word chain game logic
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
   - Make sure you're using the correct prefix (`!` by default for dictionary commands, `/` for game commands)

2. **"No definition found" errors**
   - Some words might not be in the dictionary API
   - Try alternative spellings or simpler words
   - The API works best with common English words

3. **Word Chain Game Issues**
   - "This is not a valid English word!" - The word wasn't found in the dictionary
   - "Not your turn!" - Wait for your turn in the player queue
   - Game not starting - Need at least 2 players to begin

4. **API rate limits**
   - The free APIs have rate limits
   - If using WordsAPI, check your RapidAPI dashboard for usage
   - Consider upgrading to paid plans for heavy usage

### Error Messages:

- `DISCORD_TOKEN is required` - Add your bot token to the `.env` file
- `Could not find definition` - Word not found in the dictionary
- `WordsAPI key not configured` - Add your WordsAPI key for enhanced features
- `This is not a valid English word!` - Submitted word failed dictionary validation in Word Chain
- `Word must start with "X"` - Word Chain game rule violation
- `This word has already been used!` - Word already used in current Word Chain game

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

### v2.0.0
- **NEW**: Word Chain Game feature
- **NEW**: Dictionary validation for game words
- **NEW**: Real-time multiplayer gameplay
- **NEW**: Scoring system based on letter rarity
- **NEW**: Turn-based mechanics with timeout handling
- Enhanced project structure with game utilities

### v1.0.0
- Initial release
- Basic dictionary functionality
- Support for definitions, synonyms, and antonyms
- Beautiful Discord embeds
- Error handling and user feedback
