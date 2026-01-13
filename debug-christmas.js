require('dotenv').config();
const { use } = require('@memvid/sdk');
const path = require('path');

async function run() {
    try {
        const dbPath = path.join(__dirname, 'romance.mv2');
        const mem = await use('basic', dbPath, { readOnly: true });
        console.log('Memory loaded.');

        const message = "suggest me some Christmas readings";
        const keywords = ["Christmas", "Holiday", "Fantasy", "Mystery", "Thriller", "Historical", "Contemporary", "Rock Star", "Vampire", "Werewolf", "Sport", "Hockey", "Football", "Medical"];
        const foundKeywords = keywords.filter(k => message.toLowerCase().includes(k.toLowerCase()));
        
        console.log(`Keywords found: ${foundKeywords.join(", ")}`);

        if (foundKeywords.length > 0) {
            const lexQuery = foundKeywords.join(" ");
            const lexResults = await mem.find(lexQuery, { mode: 'lex', k: 50 });
            console.log(`Lexical hits: ${lexResults.hits.length}`);
            
            // Log the top hits
            if (lexResults.hits.length > 0) {
                console.log("Top 3 Hits with Parsed Metadata:");
                
                lexResults.hits.slice(0, 3).forEach(h => {
                    const authorMatch = h.snippet.match(/Author:\s*(.+)/);
                    const coverMatch = h.snippet.match(/Cover:\s*(.+)/);
                    const genreMatch = h.snippet.match(/Genres:\s*(.+)/);
                    
                    const parsed = {
                        title: h.title,
                        author: authorMatch ? authorMatch[1].trim() : "Unknown",
                        cover: coverMatch && coverMatch[1].trim() !== 'undefined' ? coverMatch[1].trim() : "No Cover Found",
                        genres: genreMatch ? genreMatch[1].trim() : "Unknown"
                    };
                    
                    console.log(JSON.stringify(parsed, null, 2));
                });
            }
        }

    } catch (err) {
        console.error(err);
    }
}

run();
