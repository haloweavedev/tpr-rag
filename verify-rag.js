require('dotenv').config();
const { use } = require('@memvid/sdk');

async function verify() {
  console.log('--- RAG Verification Test ---');
  console.log('Loading memory: romance.mv2');
  
  const mv = await use('basic', 'romance.mv2');
  
  const question = "When was 'The Rose Field' by Philip Pullman published?";
  console.log(`Question: ${question}`);
  
  try {
      const answer = await mv.ask(question, {
        model: 'openai:gpt-4o-mini',
        k: 3
      });
      
      console.log('\nBot Answer:');
      console.log(answer.answer);
      
      const expectedDate = "10/2025";
      const expectedAlternate = "October 2025";
      if (answer.answer.includes(expectedDate) || answer.answer.includes(expectedAlternate)) {
          console.log('\n✅ SUCCESS: The bot correctly identified the publication date.');
      } else {
          console.log(`\n❌ FAILURE: The bot did not mention the expected date (${expectedDate}).`);
      }

      console.log('\nSources cited:');
      answer.sources.forEach((s, i) => console.log(`${i+1}. ${s.title}`));

  } catch (err) {
      console.error('\nError during RAG operation:', err);
  }
  
  await mv.seal();
}

verify().catch(console.error);
