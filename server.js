
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { use } = require('@memvid/sdk');
const OpenAI = require('openai');

// Enable SDK debugging
process.env.MEMVID_DEBUG = '1';

const app = express();
const PORT = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Memory Initialization
let mem;
async function init() {
  try {
      const originalDbPath = path.join(__dirname, 'romance.mv2');
      const tempDbPath = path.join('/tmp', 'romance.mv2');

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
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // 1. ROUTER & EXTRACTION STEP
    // We ask GPT-4o-mini to classify and extract keywords.
    const routerPrompt = `Analyze the user's message.
    1. Is it a greeting or small talk (e.g. "hi", "hello", "how are you") with NO intent to find a book?
    2. If it is a book request, extract specific search terms (book titles, authors, genres, tropes).
    
    Output JSON ONLY:
    {
      "is_greeting": boolean,
      "search_queries": string[] // e.g. ["Duet", "Julie Kriss"] or ["Christmas", "Romance"]
    }
    
    User Message: "${message}"`;

    const routerCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: routerPrompt }],
        response_format: { type: "json_object" }
    });

    const routerData = JSON.parse(routerCompletion.choices[0].message.content);
    console.log("Router Decision:", routerData);

    // 2. BRANCH: Greeting
    if (routerData.is_greeting) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are Minerva, the intelligent and elegant AI curator for 'The Passionate Reader'. Respond warmly, briefly, and sophisticatedly to the user's greeting. Invite them to ask for a book recommendation." },
                { role: "user", content: message }
            ]
        });
        return res.json({ reply: completion.choices[0].message.content, sources: [] });
    }

    // 3. BRANCH: Search (RAG)
    let searchPromises = [];
    
    // A. Lexical Search for each extracted term
    if (routerData.search_queries && routerData.search_queries.length > 0) {
        routerData.search_queries.forEach(q => {
            searchPromises.push(mem.find(q, { mode: 'lex', k: 10 }));
        });
    }
    
    // B. Semantic Search for the full message (Contextual backup)
    searchPromises.push(mem.find(message, { k: 10 }).catch(e => ({ hits: [] })));

    const searchResults = await Promise.all(searchPromises);
    
    // Merge & Deduplicate
    const uniqueHitsMap = new Map();
    searchResults.forEach(result => {
        if (result && result.hits) {
            result.hits.forEach(hit => {
                if (!uniqueHitsMap.has(hit.id)) {
                    uniqueHitsMap.set(hit.id, hit);
                }
            });
        }
    });

    const topHits = Array.from(uniqueHitsMap.values()).slice(0, 30);
    console.log(`Found ${topHits.length} unique hits.`);

    // 4. GENERATE RESPONSE
    const contextText = topHits.map((h, i) => `[Source ID: ${i}]\nTitle: ${h.title}\nSnippet: ${h.snippet}`).join("\n\n");
    
    const prompt = `You are Minerva, the intelligent, elegant, and warm AI curator for 'The Passionate Reader'.
    
    Your goal is to recommend books based *only* on the provided Context.
    
    CONTEXT:
    ${contextText}
    
    USER QUERY: ${message}
    
    INSTRUCTIONS:
    1. **Analyze the Context**: Look for books that match the User Query.
    2. **Conversational Fallback**: If the context contains NO relevant books for the specific request, reply conversationally as Minerva stating you couldn't find that specific information in your library, but offer to discuss the genre.
    3. **Source Selection**: If you find relevant books, select the top 1-3 best matches.
    4. **Response Format**:
       - Write a warm, engaging response in Markdown.
       - Bold book titles (e.g., **Book Title**).
       - Explain *why* you chose each book based on the review snippets.
       - **CRITICAL**: Do NOT output images or links in text.
       - **CRITICAL**: At the very end of your response, output a hidden JSON block listing the Source IDs you actually used. Format:
         
         |||JSON
         {\"used_source_ids\": [0, 4]}
         |||

    5. **Tone**: Sophisticated, passionate, literate.
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
    });

    let rawReply = completion.choices[0].message.content;
    let finalReply = rawReply;
    let finalSources = [];

    // Parse Used Sources
    // Regex to capture |||JSON ... ||| with optional spaces
    const jsonMatch = rawReply.match(/\|\|\|\s*JSON([\s\S]*?)\|\|\|/i);
    if (jsonMatch) {
        try {
            const jsonStr = jsonMatch[1].trim();
            const metadata = JSON.parse(jsonStr);
            
            if (metadata.used_source_ids && Array.isArray(metadata.used_source_ids)) {
                finalSources = metadata.used_source_ids.map(id => {
                    const hit = topHits[id];
                    if (!hit) return null;
                    
                    const authorMatch = hit.snippet.match(/Author:\s*(.+)/);
                    const coverMatch = hit.snippet.match(/Cover:\s*(.+)/);
                    const genreMatch = hit.snippet.match(/Genres:\s*(.+)/);
                    
                    return {
                        title: hit.title,
                        author: authorMatch ? authorMatch[1].trim() : "Unknown Author",
                        cover: coverMatch && coverMatch[1].trim() !== 'undefined' ? coverMatch[1].trim() : null,
                        genres: genreMatch ? genreMatch[1].trim() : "Romance"
                    };
                }).filter(s => s !== null);
            }
            finalReply = rawReply.replace(jsonMatch[0], '').trim();
        } catch (e) {
            console.error("Failed to parse LLM source metadata", e);
        }
    }

    res.json({ reply: finalReply, sources: finalSources });

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
