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

  if ('name' in command && 'execute' in command) {
    client.commands.set(command.name, command);
    console.log(`✅ Loaded command: ${command.name}`);
  } else {
    console.log(`⚠️  The command at ${filePath} is missing a required "name" or "execute" property.`);
  }
}

// When the client is ready, run this code
client.once('ready', () => {
  console.log(`🚀 ${client.user.tag} is online and ready!`);
  console.log(`📚 Dictionary bot is serving ${client.guilds.cache.size} servers`);

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
    if (interaction.options.getString('word')) {
      args.push(interaction.options.getString('word'));
    }

    // Create a mock message object for compatibility with existing commands
    const mockMessage = {
      reply: async (options) => {
        if (interaction.deferred || interaction.replied) {
          return await interaction.followUp(options);
        }
        return await interaction.reply(options);
      },
      channel: {
        sendTyping: async () => {
          if (!interaction.deferred) {
            await interaction.deferReply();
          }
        }
      },
      author: interaction.user,
      guild: interaction.guild
    };

    await command.execute(mockMessage, args);
    console.log(`📝 ${interaction.user.tag} used slash command: /${interaction.commandName}`);
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
    console.log(`📝 ${message.author.tag} used command: ${commandName} in ${message.guild?.name || 'DM'}`);
  } catch (error) {
    console.error(`❌ Error executing command ${commandName}:`, error);

    try {
      await message.reply({
        content: '❌ There was an error executing this command!',
        ephemeral: true
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
