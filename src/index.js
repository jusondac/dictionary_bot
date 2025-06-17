const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Create a collection to store commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // if ('name' in command && 'execute' in command) {
  //   client.commands.set(command.name, command);
  //   console.log(`✅ Loaded command: ${command.name}`);
  // } else {
  //   console.log(`⚠️  The command at ${filePath} is missing a required "name" or "execute" property.`);
  // }
}

// When the client is ready, run this code
client.once('ready', () => {
  // console.log(`🚀 ${client.user.tag} is online and ready!`);
  // console.log(`📚 Dictionary bot is serving ${client.guilds.cache.size} servers`);

  // Set bot activity
  client.user.setActivity('/help for commands', { type: 'WATCHING' });
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    // Convert interaction to message-like object for compatibility
    const args = [];

    // Handle different option types for different commands
    const wordOption = interaction.options.getString('word');
    if (wordOption) {
      args.push(wordOption);
    }

    // Debug logging
    // console.log(`🔍 Command: ${interaction.commandName}, Channel ID: ${interaction.channel?.id}, Guild: ${interaction.guild?.name}`);

    // Create a mock message object for compatibility with existing commands
    const mockMessage = {
      reply: async (options) => {
        if (interaction.deferred || interaction.replied) {
          return await interaction.followUp(options);
        }
        return await interaction.reply(options);
      },
      channel: {
        id: interaction.channel?.id,
        send: async (options) => {
          if (interaction.channel) {
            return await interaction.channel.send(options);
          } else {
            throw new Error('Channel not available');
          }
        },
        sendTyping: async () => {
          if (!interaction.deferred) {
            await interaction.deferReply();
          }
        }
      },
      author: {
        id: interaction.user.id,
        username: interaction.user.username,
        displayName: interaction.user.displayName || interaction.user.username,
        tag: interaction.user.tag
      },
      guild: interaction.guild,
      options: interaction.options // Add the options for slash command compatibility
    };

    await command.execute(mockMessage, args);
    // console.log(`📝 ${interaction.user.tag} used slash command: /${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ Error executing slash command ${interaction.commandName}:`, error);

    const errorMessage = { content: '❌ There was an error executing this command!', ephemeral: true };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Handle messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // First, check if there's an active word chain game and this could be a word submission
  const { games } = require('./utils/wordchain');
  const game = games.get(message.channel?.id);

  if (game && game.gameState === 'playing' && !message.content.startsWith(config.prefix)) {
    // This might be a word submission for the word chain game
    const word = message.content.trim();

    // Only process if it looks like a single word (no spaces, only letters)
    if (word && /^[a-zA-Z]+$/.test(word) && !word.includes(' ')) {
      // console.log(`🎮 Potential word submission: "${word}" from ${message.author.tag}`);

      // Import and use the word command logic
      const wordCommand = client.commands.get('word');
      if (wordCommand) {
        try {
          // Create args array with the word
          const args = [word];
          await wordCommand.execute(message, args);
          return; // Don't process as a regular command
        } catch (error) {
          console.error('Error processing word chain submission:', error);
        }
      }
    }
  }

  // Check if message starts with prefix
  if (!message.content.startsWith(config.prefix)) return;

  // Parse command and arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Get the command
  const command = client.commands.get(commandName);

  if (!command) {
    // If command doesn't exist, ignore silently or send a helpful message
    return;
  }

  try {
    // Execute the command
    await command.execute(message, args);
    // console.log(`📝 ${message.author.tag} used command: ${commandName} in ${message.guild?.name || 'DM'}`);
  } catch (error) {
    console.error(`❌ Error executing command ${commandName}:`, error);

    try {
      await message.reply({
        content: '❌ There was an error executing this command!'
      });
    } catch (replyError) {
      console.error('❌ Could not send error message:', replyError);
    }
  }
});

// Handle errors
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Check if token is provided
if (!config.token) {
  console.error('❌ No Discord token provided! Please add DISCORD_TOKEN to your .env file');
  process.exit(1);
}

// Login to Discord
client.login(config.token).catch((error) => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});
