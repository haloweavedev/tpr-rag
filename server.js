
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

// Enable SDK debugging
process.env.MEMVID_DEBUG = '1';

// DEBUG: Inspect node_modules structure on Vercel
try {
  console.log("Current directory:", __dirname);
  const rootModules = path.join(__dirname, 'node_modules');
  if (fs.existsSync(rootModules)) {
    console.log("node_modules exists at root");
    const memvidPath = path.join(rootModules, '@memvid');
    if (fs.existsSync(memvidPath)) {
        console.log("@memvid exists. Listing contents:");
        console.log(fs.readdirSync(memvidPath));
        
        const linuxPkg = path.join(memvidPath, 'sdk-linux-x64-gnu');
        if (fs.existsSync(linuxPkg)) {
           console.log("sdk-linux-x64-gnu contents:", fs.readdirSync(linuxPkg));
        } else {
           console.log("sdk-linux-x64-gnu NOT found");
        }
    } else {
        console.log("@memvid folder NOT found in node_modules");
    }
  } else {
    console.log("node_modules NOT found at", rootModules);
  }
} catch (e) {
  console.error("Error inspecting file system:", e);
}

const { use } = require('@memvid/sdk');

const OpenAI = require('openai');



const app = express();

const PORT = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



app.use(express.json());

app.use(express.static('public'));



let mem;



async function init() {



  // Open the existing memory file



  try {



      const originalDbPath = path.join(__dirname, 'romance.mv2');
      const tempDbPath = path.join('/tmp', 'romance.mv2');

      // Copy to /tmp if it doesn't exist (required for Vercel/Lambda read-only env)
      if (!fs.existsSync(tempDbPath)) {
          console.log(`Copying DB from ${originalDbPath} to ${tempDbPath}...`);
          fs.copyFileSync(originalDbPath, tempDbPath);
      }

      console.log(`Loading memory from ${tempDbPath}...`);
      mem = await use('basic', tempDbPath, { readOnly: true });



      console.log('Memory loaded.');



  } catch (err) {

      console.error("Failed to load memory:", err);

      process.exit(1);

  }

}



app.post('/api/chat', async (req, res) => {

  const { message } = req.body;

  if (!message) {

    return res.status(400).json({ error: 'Message is required' });

  }



  try {

    // 1. Keyword Extraction Strategy

    // We look for specific genre/topic keywords to boost retrieval precision.

    const keywords = ["Christmas", "Holiday", "Fantasy", "Mystery", "Thriller", "Historical", "Contemporary", "Rock Star", "Vampire", "Werewolf", "Sport", "Hockey", "Football", "Medical"];

    const foundKeywords = keywords.filter(k => message.toLowerCase().includes(k.toLowerCase()));



    if (foundKeywords.length > 0) {

        console.log(`Detected keywords: ${foundKeywords.join(", ")}. Using Hybrid Search.`);

        

                // A. Lexical Search for Keywords (High Precision)

        

                // We search JUST for the keywords to ensure books with these tags/titles are found.

        

                const lexQuery = foundKeywords.join(" ");

        

                const lexResults = await mem.find(lexQuery, { mode: 'lex', k: 50 });

        

                console.log(`Lexical Hits for '${lexQuery}': ${lexResults.hits.length}`);

        

                

        

                // B. Semantic Search for Full Query (High Recall/Understanding)

        

                // We try semantic search, but fallback to lexical if embedding fails (as seen in tests)

        

                let semResults = { hits: [] };

        

                try {

        

                     // Pass embeddingModel explicitly if needed, but 'auto' should work if environment is set.

        

                     // If not, we catch.

        

                     semResults = await mem.find(message, { k: 20 }); 

        

                } catch (e) {

        

                     console.warn("Semantic search failed/skipped, using lexical for full query.");

        

                     semResults = await mem.find(message, { mode: 'lex', k: 20 });

        

                }

        

        

        

                // C. Merge and Deduplicate Results

        

                // We prioritize Lexical hits for specific keyword queries

        

                const allHits = [...lexResults.hits, ...semResults.hits];

        

                const uniqueHitsMap = new Map();

        

                for (const hit of allHits) {

        

                    if (!uniqueHitsMap.has(hit.id)) {

        

                        uniqueHitsMap.set(hit.id, hit);

        

                    }

        

                }

        

                const uniqueHits = Array.from(uniqueHitsMap.values());

        

        

        

                // D. Rerank/Filter (Optional - we'll let LLM decide relevance)

        

                // We take top 30 unique hits to ensure we capture the relevant ones.

        

                const topHits = uniqueHits.slice(0, 30);

        

        if (topHits.length === 0) {

             return res.json({ reply: "I couldn't find any books matching those criteria.", sources: [] });

        }



                // E. Generate Answer



                const contextText = topHits.map((h, i) => `[Source #${i+1}: ${h.title}]\n${h.snippet}`).join("\n\n");



                const prompt = `You are a helpful book recommendation assistant. 



                STRICT RULES:



                1. ONLY recommend books found in the [Source] context below.



                2. If the user asks for a genre (e.g. Christmas) and you don't see any in the sources, say you don't have any in the current database.



                3. Do NOT mention real-world books that are not in the context.



                



        Context:



        ${contextText}



        



        Question: ${message}



        



        Answer:`;



        const completion = await openai.chat.completions.create({

            model: "gpt-4o-mini",

            messages: [{ role: "user", content: prompt }],

        });



        return res.json({ 

            reply: completion.choices[0].message.content, 

            sources: topHits.map(s => s.title) 

        });

    }



    // Default: Standard mem.ask for general queries without specific keywords

    const answer = await mem.ask(message, {

        model: 'openai:gpt-4o-mini', 

        k: 10

    });

    

    res.json({ 

        reply: answer.answer, 

        sources: answer.sources ? answer.sources.map(s => s.title) : [] 

    });



  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
