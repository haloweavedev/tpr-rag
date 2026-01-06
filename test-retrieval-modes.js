require('dotenv').config();
const { use } = require('@memvid/sdk');

async function testModes() {
  const mv = await use('basic', 'romance.mv2');
  const question = "Christmas"; // SIMPLIFIED QUERY
  
  console.log(`Question: ${question}\n`);

  // Test Semantic
  // console.log("--- Testing Semantic Mode (k=10) ---");
  // const semResults = await mv.find(question, { mode: 'sem', k: 10, embeddingModel: 'openai-small' });
  // semResults.hits.forEach(h => console.log(`[SEM] ${h.score.toFixed(3)}: ${h.title}`));
  
  const semResults = { hits: [] }; // Mock for now

  console.log("\n--- Testing Lexical Mode (k=10) ---");
  const lexResults = await mv.find(question, { mode: 'lex', k: 10 });
  lexResults.hits.forEach(h => console.log(`[LEX] ${h.score.toFixed(3)}: ${h.title}`));

  // Check which one found the target books
  const targets = ["The Christmas Miracle of Jonathan Toomey", "The Plight Before Christmas", "Hunk for the Holidays"];
  
  const semFound = semResults.hits.filter(h => targets.some(t => h.title.includes(t))).length;
  const lexFound = lexResults.hits.filter(h => targets.some(t => h.title.includes(t))).length;

  console.log(`\nSemantic found: ${semFound}/3 targets`);
  console.log(`Lexical found:  ${lexFound}/3 targets`);

  await mv.seal();
}

testModes().catch(console.error);
