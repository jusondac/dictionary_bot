const axios = require('axios');
const config = require('../config/config');

class DictionaryAPI {
  constructor() {
    this.baseURL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    this.wordsApiURL = 'https://wordsapiv1.p.rapidapi.com/words/';
  }

  // Get word definition using free Dictionary API
  async getDefinition(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word}`);
      const data = response.data[0];

      if (!data) {
        throw new Error('No definition found');
      }

      const definitions = [];
      data.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example || null
          });
        });
      });

      return {
        word: data.word,
        phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
        definitions: definitions.slice(0, 10), // Show up to 10 definitions to avoid embed limits
        sourceUrls: data.sourceUrls || []
      };
    } catch (error) {
      throw new Error(`Could not find definition for "${word}"`);
    }
  }

  // Get synonyms using WordsAPI (requires API key)
  async getSynonyms(word) {
    try {
      if (!config.wordsApiKey) {
        console.log('WordsAPI key not configured, using fallback method');
        // Use fallback immediately if no API key
        return this.getSynonymsFallback(word);
      }

      const response = await axios.get(`${this.wordsApiURL}${word}/synonyms`, {
        headers: {
          'X-RapidAPI-Key': config.wordsApiKey,
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      return {
        word: word,
        synonyms: response.data.synonyms || []
      };
    } catch (error) {
      console.log('WordsAPI failed, using fallback:', error.message);
      // Fallback to free API that might have some synonyms
      return this.getSynonymsFallback(word);
    }
  }

  // Fallback method for getting synonyms from free API
  async getSynonymsFallback(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word}`);
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
    } catch (fallbackError) {
      if (fallbackError.response && fallbackError.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find synonyms for "${word}". Please try a different word.`);
    }
  }

  // Get antonyms using WordsAPI (requires API key)
  async getAntonyms(word) {
    try {
      if (!config.wordsApiKey) {
        console.log('WordsAPI key not configured, using fallback method');
        // Use fallback immediately if no API key
        return this.getAntonymsFallback(word);
      }

      const response = await axios.get(`${this.wordsApiURL}${word}/antonyms`, {
        headers: {
          'X-RapidAPI-Key': config.wordsApiKey,
          'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
      });

      return {
        word: word,
        antonyms: response.data.antonyms || []
      };
    } catch (error) {
      console.log('WordsAPI failed, using fallback:', error.message);
      // Fallback to free API that might have some antonyms
      return this.getAntonymsFallback(word);
    }
  }

  // Fallback method for getting antonyms from free API
  async getAntonymsFallback(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word}`);
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
    } catch (fallbackError) {
      if (fallbackError.response && fallbackError.response.status === 404) {
        throw new Error(`The word "${word}" was not found. Please check the spelling and try again.`);
      }
      throw new Error(`Could not find antonyms for "${word}". Please try a different word.`);
    }
  }

  // Get complete word information
  async getWordInfo(word) {
    try {
      const response = await axios.get(`${this.baseURL}${word}`);
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
      throw new Error(`Could not find information for "${word}"`);
    }
  }
}

module.exports = new DictionaryAPI();
