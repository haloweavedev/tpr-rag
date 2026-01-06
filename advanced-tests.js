require('dotenv').config();
const { use } = require('@memvid/sdk');

const testCases = [
    // --- Suggestion Tests ---
    {
        id: 1,
        type: "suggestion",
        question: "Suggest a romance book involving a rock star.",
        expectedPhrases: ["Duet", "Julie Kriss", "Denver"],
        description: "Suggestion: Rock star romance"
    },
    {
        id: 2,
        type: "suggestion",
        question: "Can you recommend a fantasy book published in late 2025?",
        expectedPhrases: ["The Rose Field", "The Everlasting", "Philip Pullman", "Alix E. Harrow"],
        description: "Suggestion: Fantasy + Date constraint"
    },
    {
        id: 3,
        type: "suggestion",
        question: "I want to read a Christmas romance. What do you have?",
        expectedPhrases: ["The Christmas Miracle of Jonathan Toomey", "The Plight Before Christmas", "Hunk for the Holidays"],
        description: "Suggestion: Genre constraint"
    },

    // --- Detail Accuracy Tests ---
    {
        id: 4,
        type: "detail",
        question: "In 'Duet' by Julie Kriss, what instrument does Callie play?",
        expectedPhrases: ["piano", "jazz gig"],
        description: "Detail: Character profession/skill"
    },
    {
        id: 5,
        type: "detail",
        question: "Who are the familiars in 'How to Summon a Fairy Godmother'?",
        expectedPhrases: ["Kaz", "snarky", "gorgeous"],
        description: "Detail: Minor characters"
    },
    {
        id: 6,
        type: "detail",
        question: "What is Hatch Kershaw's profession in 'Rebel Bride'?",
        expectedPhrases: ["hockey star", "hockey player", "NHL"],
        description: "Detail: Character profession"
    },

    // --- Date/Metadata Tests ---
    {
        id: 7,
        type: "date",
        question: "List the books published in October 2025.",
        expectedPhrases: ["The Rose Field", "The Plight Before Christmas", "The Everlasting", "Rebel Bride"],
        description: "Date: List by month/year"
    },
    {
        id: 8,
        type: "date",
        question: "When was 'Hunk for the Holidays' published?",
        expectedPhrases: ["2012", "09/2012", "September 2012"],
        description: "Date: Specific book date"
    }
];

async function runAdvancedTests() {
    console.log("Starting Advanced RAG Tests...");
    console.log(`Total Test Cases: ${testCases.length}\n`);

    const mv = await use('basic', 'romance.mv2');
    let passedCount = 0;
    const results = [];

    for (const test of testCases) {
        process.stdout.write(`Running Test #${test.id}: ${test.description}... `);
        
        const start = Date.now();
        try {
            const answer = await mv.ask(test.question, {
                model: 'openai:gpt-4o-mini',
                k: 10 // Using higher k for broader searches
            });
            const duration = Date.now() - start;

            const botReply = answer.answer;
            const sources = answer.sources ? answer.sources.map(s => s.title) : [];
            
            // Flexible matching: For suggestions, we want to see AT LEAST ONE relevant book.
            // For details, we want specific keywords.
            // For lists, we want to see if it captures multiple items if possible.
            
            let passed = false;
            
            if (test.type === 'suggestion' || test.type === 'date') {
                 // Pass if it mentions at least one expected item
                 passed = test.expectedPhrases.some(phrase => 
                    botReply.toLowerCase().includes(phrase.toLowerCase())
                );
            } else {
                 // For details, usually need the specific answer
                 passed = test.expectedPhrases.some(phrase => 
                    botReply.toLowerCase().includes(phrase.toLowerCase())
                );
            }

            if (passed) passedCount++;

            results.push({
                ...test,
                passed,
                botReply,
                sources,
                duration
            });

            console.log(passed ? "✅ PASS" : "❌ FAIL");

        } catch (err) {
            console.log("❌ ERROR");
            results.push({
                ...test,
                passed: false,
                error: err.message
            });
        }
    }

    await mv.seal();

    console.log("\n--- ADVANCED TEST REPORT ---");
    console.log(`Score: ${passedCount}/${testCases.length} (${((passedCount / testCases.length) * 100).toFixed(1)}%)`);
    
    console.log("\nDetailed Results:");
    results.forEach(r => {
        console.log(`\nTest #${r.id}: ${r.question}`);
        console.log(`Expected (one of): "${r.expectedPhrases.join('" OR "')}"`);
        console.log(`Actual:   "${r.botReply}"`);
        // if (r.sources.length) console.log(`Sources:  ${r.sources.join(", ")}`); // Optional: hide sources for brevity
        console.log(`Result:   ${r.passed ? "PASS" : "FAIL"} (${r.duration}ms)`);
    });
}

runAdvancedTests().catch(console.error);
