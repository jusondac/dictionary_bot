const axios = require('axios');

class DictionaryAPI {
  constructor() {
    this.baseURL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  }

  // Get word definition using free Dictionary API
  async getDefinition(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word.toLowerCase()}`);
      const data = response.data[0];

      if (!data) {
        throw new Error('No definition found');
      }

      const definitions = [];
      data.meanings.forEach(meaning => {
        if (meaning.definitions && Array.isArray(meaning.definitions)) {
          meaning.definitions.forEach(def => {
            if (def.definition) { // Only add if definition exists
              definitions.push({
                partOfSpeech: meaning.partOfSpeech,
                definition: def.definition,
                example: def.example || null
              });
            }
          });
        }
      });

      if (definitions.length === 0) {
        throw new Error(`No valid definitions found for "${word}"`);
      }

      return {
        word: data.word,
        phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
        definitions: definitions.slice(0, 10), // Show up to 10 definitions to avoid embed limits
        sourceUrls: data.sourceUrls || []
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find definition for "${word}"`);
    }
  }

  // Get synonyms from free API
  async getSynonyms(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word.toLowerCase()}`);
      const data = response.data[0];
      const synonyms = [];

      // Extract synonyms from both definitions and meanings level
      data.meanings.forEach(meaning => {
        // Get synonyms from the meaning level (part of speech level)
        if (meaning.synonyms && meaning.synonyms.length > 0) {
          synonyms.push(...meaning.synonyms);
        }

        // Get synonyms from individual definitions
        meaning.definitions.forEach(def => {
          if (def.synonyms && def.synonyms.length > 0) {
            synonyms.push(...def.synonyms);
          }
        });
      });

      const uniqueSynonyms = [...new Set(synonyms)]; // Remove duplicates

      if (uniqueSynonyms.length === 0) {
        throw new Error(`No synonyms found for "${word}". Try a different word or check the spelling.`);
      }

      return {
        word: word,
        synonyms: uniqueSynonyms
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find synonyms for "${word}". Please try a different word.`);
    }
  }

  // Get antonyms from free API
  async getAntonyms(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word.toLowerCase()}`);
      const data = response.data[0];
      const antonyms = [];

      // Extract antonyms from both definitions and meanings level
      data.meanings.forEach(meaning => {
        // Get antonyms from the meaning level (part of speech level)
        if (meaning.antonyms && meaning.antonyms.length > 0) {
          antonyms.push(...meaning.antonyms);
        }

        // Get antonyms from individual definitions
        meaning.definitions.forEach(def => {
          if (def.antonyms && def.antonyms.length > 0) {
            antonyms.push(...def.antonyms);
          }
        });
      });

      const uniqueAntonyms = [...new Set(antonyms)]; // Remove duplicates

      if (uniqueAntonyms.length === 0) {
        throw new Error(`No antonyms found for "${word}". Try a different word or check the spelling.`);
      }

      return {
        word: word,
        antonyms: uniqueAntonyms
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find antonyms for "${word}". Please try a different word.`);
    }
  }

  // Get complete word information
  async getWordInfo(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word.toLowerCase()}`);
      const data = response.data[0];

      if (!data) {
        throw new Error('No definition found');
      }

      const definitions = [];
      const synonyms = [];
      const antonyms = [];

      data.meanings.forEach(meaning => {
        // Extract synonyms and antonyms from meaning level
        if (meaning.synonyms && meaning.synonyms.length > 0) {
          synonyms.push(...meaning.synonyms);
        }
        if (meaning.antonyms && meaning.antonyms.length > 0) {
          antonyms.push(...meaning.antonyms);
        }

        meaning.definitions.forEach(def => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example || null
          });

          // Extract synonyms and antonyms from definition level
          if (def.synonyms && def.synonyms.length > 0) {
            synonyms.push(...def.synonyms);
          }
          if (def.antonyms && def.antonyms.length > 0) {
            antonyms.push(...def.antonyms);
          }
        });
      });

      return {
        word: data.word,
        phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
        definitions: definitions.slice(0, 10), // Show up to 10 definitions to avoid embed limits
        synonyms: [...new Set(synonyms)].slice(0, 5), // Remove duplicates and limit to 5
        antonyms: [...new Set(antonyms)].slice(0, 5), // Remove duplicates and limit to 5
        sourceUrls: data.sourceUrls || []
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find information for "${word}"`);
    }
  }
}

module.exports = new DictionaryAPI();
