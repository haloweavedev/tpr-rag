
require('dotenv').config();
const { use } = require('@memvid/sdk');

async function test() {
  console.log('Loading memory...');
  const mv = await use('basic', 'romance.mv2');
  console.log('Asking question...');
  try {
      const answer = await mv.ask("What books by Philip Pullman are mentioned?", {
        model: 'openai:gpt-4o-mini',
        k: 3
      });
      console.log('Answer object:', JSON.stringify(answer, null, 2));
  } catch (err) {
      console.error('Error during ask:', err);
  }
  await mv.seal();
}

test().catch(console.error);
