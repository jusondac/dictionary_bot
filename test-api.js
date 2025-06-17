// Simple test script to verify the dictionary API is working
const dictionaryAPI = require('./src/utils/dictionary');

async function testAPI() {
  console.log('🧪 Testing Dictionary API...\n');

  try {
    console.log('📖 Testing definition lookup...');
    const definition = await dictionaryAPI.getDefinition('hello');
    console.log('✅ Definition test passed!');
    console.log(`Word: ${definition.word}`);
    console.log(`Phonetic: ${definition.phonetic}`);
    console.log(`Definitions found: ${definition.definitions.length}\n`);

    console.log('🔗 Testing synonyms...');
    const synonyms = await dictionaryAPI.getSynonyms('happy');
    console.log('✅ Synonyms test passed!');
    console.log(`Synonyms for "happy": ${synonyms.synonyms.join(', ') || 'None found'}\n`);

    console.log('🔀 Testing antonyms...');
    const antonyms = await dictionaryAPI.getAntonyms('good');
    console.log('✅ Antonyms test passed!');
    console.log(`Antonyms for "good": ${antonyms.antonyms.join(', ') || 'None found'}\n`);

    console.log('📋 Testing complete word info...');
    const wordInfo = await dictionaryAPI.getWordInfo('beautiful');
    console.log('✅ Complete word info test passed!');
    console.log(`Word: ${wordInfo.word}`);
    console.log(`Definitions: ${wordInfo.definitions.length}`);
    console.log(`Synonyms: ${wordInfo.synonyms.length}`);
    console.log(`Antonyms: ${wordInfo.antonyms.length}\n`);

    console.log('🎉 All API tests passed! Your dictionary bot is ready to use.');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 This might be due to:');
    console.log('   - No internet connection');
    console.log('   - API service temporarily unavailable');
    console.log('   - Rate limiting (try again in a moment)');
  }
}

// Run the test
testAPI();
