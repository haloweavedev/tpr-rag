
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
// Session Store (In-memory)
const sessions = new Map();

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
  const { message, sessionId = 'default' } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Retrieve History
    let history = sessions.get(sessionId) || [];
    const recentHistory = history.slice(-6); // Last 3 turns
    const historyText = recentHistory.map(h => `${h.role === 'user' ? 'User' : 'Minerva'}: ${h.content}`).join("\n");

    // 1. ROUTER & EXTRACTION STEP
    // We ask GPT-4o-mini to classify and extract keywords, GIVEN the history.
    const routerPrompt = `Analyze the user's message in the context of the conversation.
    
    Conversation History:
    ${historyText}
    
    Current Message: "${message}"

    Tasks:
    1. Is it a greeting/small talk with NO intent to find/discuss a book? (If they ask "tell me more", that is NOT small talk).
    2. Extract search terms. 
       - If the user refers to "it", "that book", "the first one", etc., YOU MUST RESOLVE THIS REFERENCE using the Conversation History.
       - Extract the EXACT title of the book they are referring to.
       - If they ask for "light" or "funny" books, extract those genre keywords.
    
    Output JSON ONLY:
    {
      "is_greeting": boolean,
      "search_queries": string[] // e.g. ["The Rosie Project"] if resolving "it", or ["light romance", "funny"]
    }`;

    const routerCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: routerPrompt }],
        response_format: { type: "json_object" }
    });

    const routerData = JSON.parse(routerCompletion.choices[0].message.content);
    console.log("Router Decision:", JSON.stringify(routerData, null, 2));

    // 2. BRANCH: Greeting (Only if NO search queries are found AND it looks like a greeting)
    // If router extracts queries (even from history), we skip greeting mode.
    if (routerData.is_greeting && (!routerData.search_queries || routerData.search_queries.length === 0)) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are Minerva, the intelligent and elegant AI curator for 'The Passionate Reader'. Respond warmly, briefly, and sophisticatedly to the user's greeting. Invite them to ask for a book recommendation." },
                { role: "user", content: message }
            ]
        });
        
        const reply = completion.choices[0].message.content;
        
        // Save to History
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: reply });
        if (history.length > 10) history = history.slice(-10);
        sessions.set(sessionId, history);

        return res.json({ reply, sources: [] });
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
    
    Your goal is to recommend books or answer questions based on the Context and History.
    
    CONVERSATION HISTORY:
    ${historyText}

    CONTEXT:
    ${contextText}
    
    USER QUERY: ${message}
    
    INSTRUCTIONS:
    1. **Analyze**: Use History to understand references (e.g. "it", "that one"). Use Context to find facts.
    2. **STRICT NO HALLUCINATION POLICY**: 
       - You MUST ONLY recommend books that appear in the **CONTEXT** section above.
       - If the user asks about a book that is NOT in the Context (even if it was mentioned in History), you must say: "I apologize, but I don't have the specific details for [Book Title] in my current library view to give you an accurate review."
       - Do NOT invent reviews, plots, or authors.
    3. **Answer**: Provide a specific answer. If recommending, suggest top 1-3 books from CONTEXT.
    4. **Format**: Markdown, bold titles, clean text (NO images/links).
    5. **Source Tracking**: Output hidden JSON at end listing Used Source IDs.
         |||JSON
         {\"used_source_ids\": [0]}
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

    // Save to History
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: finalReply }); // Save cleaned reply
    if (history.length > 10) history = history.slice(-10);
    sessions.set(sessionId, history);

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
