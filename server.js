
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

// Enable SDK debugging
process.env.MEMVID_DEBUG = '1';

const { use } = require('@memvid/sdk');

const OpenAI = require('openai');



const app = express();

const PORT = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



app.use(express.json());

// DEBUG: Check public folder
const publicPath = path.join(__dirname, 'public');
console.log("Public path:", publicPath);
if (fs.existsSync(publicPath)) {
    console.log("Public folder exists. Contents:", fs.readdirSync(publicPath));
} else {
    console.log("Public folder NOT found at:", publicPath);
}

app.use(express.static(publicPath));

// Fallback for root
app.get('/', (req, res) => {
    if (fs.existsSync(path.join(publicPath, 'index.html'))) {
        res.sendFile(path.join(publicPath, 'index.html'));
    } else {
        res.status(404).send('Index.html not found in public folder.');
    }
});

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

                const prompt = `You are a helpful book recommendation assistant. Based on the following database excerpts, suggest some books that match the user's request.
                
                Guidelines:
                1. Suggest up to 3 distinct books found in the context.
                2. If fewer than 3 relevant books are in the context, ONLY suggest the ones found. Do NOT hallucinate or mention outside books.
                3. Briefly explain WHY you are recommending them based on the review snippets.
                4. Mention the author and any relevant tags like "Christmas romance".

        Context:
        ${contextText}

        Question: ${message}

        Answer:`;



        const completion = await openai.chat.completions.create({

            model: "gpt-4o-mini",

            messages: [{ role: "user", content: prompt }],

        });

        // Parse sources to extract metadata for UI
        const structuredSources = topHits.map(h => {
            const authorMatch = h.snippet.match(/Author:\s*(.+)/);
            const coverMatch = h.snippet.match(/Cover:\s*(.+)/);
            const genreMatch = h.snippet.match(/Genres:\s*(.+)/);
            const sensualityMatch = h.snippet.match(/Sensuality:\s*(.+)/);
            
            return {
                title: h.title,
                author: authorMatch ? authorMatch[1].trim() : "Unknown Author",
                cover: coverMatch && coverMatch[1].trim() !== 'undefined' ? coverMatch[1].trim() : null,
                genres: genreMatch ? genreMatch[1].trim() : "Unknown Genre",
                sensuality: sensualityMatch ? sensualityMatch[1].trim() : null,
                snippet: h.snippet
            };
        });

        return res.json({ 
            reply: completion.choices[0].message.content, 
            sources: structuredSources 
        });
    }

    // Default: Standard mem.ask for general queries without specific keywords
    const answer = await mem.ask(message, {
        model: 'openai:gpt-4o-mini', 
        k: 10
    });
    
    // For default ask, we might not have rich snippets, but we try to match structure
    const defaultSources = answer.sources ? answer.sources.map(s => ({
        title: s.title,
        author: "Unknown (General Search)",
        genres: "General",
        snippet: s.snippet || ""
    })) : [];

    res.json({ 
        reply: answer.answer, 
        sources: defaultSources
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
