// Quick test for synonyms
const dictionaryAPI = require('./src/utils/dictionary');

async function quickTest() {
  try {
    console.log('Testing synonyms for "hot"...');
    const synonyms = await dictionaryAPI.getSynonyms('hot');
    console.log('✅ Synonyms found:', synonyms.synonyms.length);
    console.log('Synonyms:', synonyms.synonyms.slice(0, 10).join(', '));
    
    console.log('\nTesting antonyms for "hot"...');
    const antonyms = await dictionaryAPI.getAntonyms('hot');
    console.log('✅ Antonyms found:', antonyms.antonyms.length);
    console.log('Antonyms:', antonyms.antonyms.slice(0, 10).join(', '));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
