const { EmbedBuilder } = require('discord.js');

class EmbedHelper {
  static createDefinitionEmbed(wordData) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2) // Discord's brand color
      .setTitle(`📖 ${wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1)}`)
      .setTimestamp();

    // Add pronunciation if available
    if (wordData.phonetic) {
      embed.setDescription(`🗣️ **Pronunciation:** \`${wordData.phonetic}\``);
    }

    // Group definitions by part of speech
    const groupedDefinitions = {};
    wordData.definitions.forEach(def => {
      if (!groupedDefinitions[def.partOfSpeech]) {
        groupedDefinitions[def.partOfSpeech] = [];
      }
      groupedDefinitions[def.partOfSpeech].push(def);
    });

    // Add grouped definitions
    Object.entries(groupedDefinitions).forEach(([partOfSpeech, definitions]) => {
      const partOfSpeechEmoji = {
        'noun': '📄',
        'verb': '⚡',
        'adjective': '🎨',
        'adverb': '🔄',
        'pronoun': '👤',
        'preposition': '🔗',
        'conjunction': '➕',
        'interjection': '❗'
      };

      const emoji = partOfSpeechEmoji[partOfSpeech] || '📝';
      const partOfSpeechLabel = `${partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1)}`;

      // Create a numbered list of definitions for this part of speech
      let fieldValue = '';
      definitions.forEach((def, index) => {
        const definitionText = `**${index + 1}.** ${def.definition}`;
        const exampleText = def.example ? `\n💭 *"${def.example}"*` : '';
        const newContent = definitionText + exampleText;

        // Check if adding this definition would exceed Discord's field limit (1024 chars)
        if (fieldValue.length + newContent.length + 2 > 1024) {
          return; // Skip this definition if it would exceed limit
        }

        fieldValue += newContent;
        if (index < definitions.length - 1 && fieldValue.length < 950) { // Leave room for spacing
          fieldValue += '\n\n';
        }
      });

      // Only add field if there's content
      if (fieldValue.trim()) {
        embed.addFields({
          name: `${emoji} ${partOfSpeechLabel}`,
          value: fieldValue,
          inline: false
        });
      }
    });

    // Add synonyms if available
    if (wordData.synonyms && wordData.synonyms.length > 0) {
      embed.addFields({
        name: '🔗 Synonyms',
        value: wordData.synonyms.slice(0, 5).join(' • '),
        inline: true
      });
    }

    // Add antonyms if available
    if (wordData.antonyms && wordData.antonyms.length > 0) {
      embed.addFields({
        name: '🔀 Antonyms',
        value: wordData.antonyms.slice(0, 5).join(' • '),
        inline: true
      });
    }

    embed.setFooter({
      text: '📚 Dicky : Dictionary key ✨',
    });

    return embed;
  }

  static createSynonymsEmbed(word, synonyms) {
    const embed = new EmbedBuilder()
      .setColor(0x57F287) // Green color
      .setTitle(`🔗 Synonyms for: ${word.charAt(0).toUpperCase() + word.slice(1)}`)
      .setTimestamp();

    if (synonyms.length > 0) {
      // Limit to 20 synonyms and format nicely
      const limitedSynonyms = synonyms.slice(0, 20);
      embed.setDescription(`✨ ${limitedSynonyms.join(' • ')}`);

      if (synonyms.length > 20) {
        embed.addFields({
          name: '📝 Note',
          value: `Showing 20 out of ${synonyms.length} synonyms found.`,
          inline: false
        });
      }
    } else {
      embed.setDescription('❌ No synonyms found for this word.');
    }

    embed.setFooter({
      text: '📚 Dicky : Dictionary key ✨',
    });

    return embed;
  }

  static createAntonymsEmbed(word, antonyms) {
    const embed = new EmbedBuilder()
      .setColor(0xED4245) // Red color
      .setTitle(`🔀 Antonyms for: ${word.charAt(0).toUpperCase() + word.slice(1)}`)
      .setTimestamp();

    if (antonyms.length > 0) {
      // Limit to 20 antonyms and format nicely
      const limitedAntonyms = antonyms.slice(0, 20);
      embed.setDescription(`⚡ ${limitedAntonyms.join(' • ')}`);

      if (antonyms.length > 20) {
        embed.addFields({
          name: '📝 Note',
          value: `Showing 20 out of ${antonyms.length} antonyms found.`,
          inline: false
        });
      }
    } else {
      embed.setDescription('❌ No antonyms found for this word.');
    }

    embed.setFooter({
      text: '📚 Dicky : Dictionary key ✨',
    });

    return embed;
  }

  static createErrorEmbed(error) {
    return new EmbedBuilder()
      .setColor(0xED4245) // Discord red
      .setTitle('❌ Oops! Something went wrong')
      .setDescription(`🔍 ${error}`)
      .setTimestamp()
      .setFooter({
        text: '📚 Dicky : Dictionary key ✨',
      });
  }

  static createHelpEmbed() {
    return new EmbedBuilder()
      .setColor(0x5865F2) // Discord brand color
      .setTitle('📚 Dicky : Dictionary key ✨ - Command Guide')
      .setDescription('🌟 **Welcome!** Here are all the slash commands you can use:')
      .addFields(
        {
          name: '📖 `/define <word>`',
          value: '> Get a comprehensive definition of any word\n> *Example: `/define magnificent`*',
          inline: false
        },
        {
          name: '🔗 `/synonyms <word>`',
          value: '> Find words with similar meanings\n> *Example: `/synonyms happy`*',
          inline: false
        },
        {
          name: '🔀 `/antonyms <word>`',
          value: '> Discover words with opposite meanings\n> *Example: `/antonyms good`*',
          inline: false
        },
        {
          name: '📋 `/word <word>`',
          value: '> Get complete information about a word\n> *Example: `/word fantastic`*',
          inline: false
        },
        {
          name: '❓ `/help`',
          value: '> Show this help guide\n> *You\'re looking at it right now!*',
          inline: false
        }
      )
      .addFields(
        {
          name: '💡 Pro Tips',
          value: '🚀 Use **slash commands** (`/`) for the best experience!\n🎯 They provide auto-completion and validation\n✨ Simply type `/` to see all available commands',
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({
        text: '📚 Dicky : Dictionary key ✨ • Made with ❤️',
      });
  }
}

module.exports = EmbedHelper;
