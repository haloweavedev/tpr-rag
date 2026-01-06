require('dotenv').config();
const { use } = require('@memvid/sdk');

// Define test cases
const testCases = [
    {
        id: 1,
        type: "fact",
        question: "When was 'The Rose Field' by Philip Pullman published?",
        expectedPhrases: ["10/2025", "October 2025", "2025"],
        description: "Check publication date accuracy."
    },
    {
        id: 2,
        type: "fact",
        question: "What grade did 'The Rose Field' receive?",
        expectedPhrases: ["B"], // Just look for the grade letter itself in a positive context if possible, but simpler: checks if 'B' is there.
        description: "Check specific review grade."
    },
    {
        id: 3,
        type: "quote",
        question: "Complete the sentence: 'If you were to ask me what the greatest fantasy series ever is...'",
        expectedPhrases: ["I’d not hesitate to say: His Dark Materials", "I'd not hesitate to say: His Dark Materials", "His Dark Materials"],
        description: "Check exact sentence completion."
    },
    {
        id: 4,
        type: "plot",
        question: "Who is the 'Hunk for the Holidays' in Katie Lane's book?",
        expectedPhrases: ["James Sutton"],
        description: "Check character identification."
    },
    {
        id: 5,
        type: "detail",
        question: "Who narrated the audiobook for 'The Christmas Miracle of Jonathan Toomey'?",
        expectedPhrases: ["James Earl Jones"],
        description: "Check specific detail retrieval."
    },
    {
        id: 6,
        type: "summary",
        question: "Why was 'The Plight Before Christmas' criticized?",
        expectedPhrases: ["needs an editor", "manufactures so much angst", "late thirties who behave at least ten years younger", "cheated"],
        description: "Check synthesis of negative points."
    },
    {
        id: 7,
        type: "fact",
        question: "Which company published 'The Plight Before Christmas'?",
        expectedPhrases: ["Lyrical Press"],
        description: "Check publisher information."
    }
];

async function runBenchmark() {
    console.log("Starting RAG Benchmark...");
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
                k: 10
            });
            const duration = Date.now() - start;

            const botReply = answer.answer;
            const sources = answer.sources ? answer.sources.map(s => s.title) : [];

            // Check against expected phrases (any match is a pass for now, but strictly we might want all keywords)
            // Here we check if AT LEAST ONE of the expected phrases is present.
            // For quotes, we need exact match usually, but flexible string matching is better for LLM variance. 
            
            const passed = test.expectedPhrases.some(phrase => 
                botReply.toLowerCase().includes(phrase.toLowerCase())
            );

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

    console.log("\n--- BENCHMARK REPORT ---");
    console.log(`Score: ${passedCount}/${testCases.length} (${((passedCount / testCases.length) * 100).toFixed(1)}%)`);
    
    console.log("\nDetailed Results:");
    results.forEach(r => {
        console.log(`\nTest #${r.id}: ${r.question}`);
        console.log(`Expected: "${r.expectedPhrases.join('" OR "')}"`);
        console.log(`Actual:   "${r.botReply}"`);
        if (r.sources.length) console.log(`Sources:  ${r.sources.join(", ")}`);
        console.log(`Result:   ${r.passed ? "PASS" : "FAIL"} (${r.duration}ms)`);
    });
}

runBenchmark().catch(console.error);
