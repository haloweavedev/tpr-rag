require('dotenv').config();
const fs = require('fs');
const { create } = require('@memvid/sdk');
const cliProgress = require('cli-progress');

async function ingest() {
  console.log('Reading data file...');
  const rawData = fs.readFileSync('aar-author-204.txt', 'utf8');
  const data = JSON.parse(rawData);

  // Ingest ALL items
  const itemsToIngest = data.items;
  const totalItems = itemsToIngest.length;
  
  console.log(`Found ${totalItems} items. Preparing to ingest all...`);

  // Create memory file
  console.log('Creating memory file "romance.mv2"...');
  const mv = await create('romance.mv2');
  
  // Enable lexical search index
  await mv.enableLex();

  // Initialize progress bar
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(totalItems, 0);

  // Prepare batch
  const documents = itemsToIngest.map(item => {
    // Construct a rich text representation including all metadata
    const meta = item.book;
    
    const genres = item.taxonomies['book-type'] ? item.taxonomies['book-type'].map(t => t.name).join(", ") : 'Unknown';
    const tags = item.taxonomies['review-tag'] ? item.taxonomies['review-tag'].map(t => t.name).join(", ") : '';
    
    // explicit "Fact Sheet" style header to help RAG
    const header = [
        `Title: ${meta.title || item.post.title}`,
        `Author: ${meta.author_first} ${meta.author_last}`,
        `Cover: ${item.featured_image ? item.featured_image.url : ''}`,
        `Publisher: ${meta.publisher || 'Unknown'}`,
        `Publication Date: ${meta.publish_date || item.post.date}`,
        `Genres: ${genres}`,
        `Tags: ${tags}`,
        `ISBN: ${meta.isbn || 'N/A'}`,
        `Grade: ${meta.grade || 'N/A'}`,
        `Sensuality: ${meta.sensuality || 'N/A'}`,
        `Series: ${item.meta && item.meta['wpcf-series1'] === 'Yes' ? 'Yes' : 'No'}`
    ].join('\n');

    const fullText = `${header}\n\nREVIEW CONTENT:\n${item.content.text}`;

    return {
      title: item.post.title,
      label: 'review',
      text: fullText,
      metadata: {
        author: `${meta.author_first} ${meta.author_last}`,
        grade: meta.grade,
        date: meta.publish_date,
        publisher: meta.publisher,
        url: item.post.permalink,
        coverUrl: item.featured_image ? item.featured_image.url : null
      },
      tags: item.taxonomies['book-type'] ? item.taxonomies['book-type'].map(t => t.name) : [],
      enableEmbedding: true,
      embeddingModel: "openai-small"
    };
  });

  // memvid's putMany is efficient, but we can't update progress bar per item easily if we do one giant batch.
  // However, putMany returns frameIds. 
  // To show progress, we can chunk the array ourselves or just show a spinner. 
  // Given 287 items, let's chunk it into batches of 50 so the bar moves.

  const batchSize = 50;
  for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      await mv.putMany(batch);
      progressBar.increment(batch.length);
  }

  progressBar.stop();
  console.log('Ingestion complete.');

  await mv.seal();
  console.log('Memory sealed.');
}

ingest().catch(console.error);