const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./src/config/config');

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// Array to hold slash command data
const commands = [];

// Read command files
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Build slash commands array
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else if ('name' in command && 'description' in command) {
    // Convert existing command format to slash command format
    const slashCommand = {
      name: command.name,
      description: command.description
    };

    // Add word parameter for commands that need it
    if (['define', 'synonyms', 'antonyms', 'word'].includes(command.name)) {
      slashCommand.options = [{
        name: 'word',
        type: 3, // STRING type
        description: 'The word to look up',
        required: true
      }];
    }

    commands.push(slashCommand);
    console.log(`✅ Converted command: ${command.name}`);
  }
}

// Deploy commands
async function deployCommands() {
  try {
    console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);

    // List deployed commands
    console.log('\n📋 Deployed commands:');
    data.forEach(cmd => {
      console.log(`   /${cmd.name} - ${cmd.description}`);
    });

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}

deployCommands();
