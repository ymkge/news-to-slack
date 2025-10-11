import Parser from 'rss-parser';
import { readDb } from './db';

// --- RSS Parser Initialization ---
const parser = new Parser();

/**
 * Fetches news from all registered RSS feeds and formats them.
 * Throws an error if any of the RSS feeds fail to parse or are invalid.
 * @returns Formatted news data.
 */
export async function fetchAllNews() {
  const { newsSources } = await readDb();
  if (newsSources.length === 0) {
    return { news: [] };
  }

  const allNewsItems: any[] = [];

  for (const source of newsSources) {
    try {
      const feed = await parser.parseURL(source.url);
      
      // Add a check to ensure the feed and its items are valid
      if (!feed || !Array.isArray(feed.items)) {
        throw new Error('Invalid or empty RSS feed structure returned.');
      }

      const newsItems = feed.items.slice(0, 5).map(item => ({
        title: item.title || 'No Title',
        url: item.link || '#',
        snippet: item.contentSnippet?.substring(0, 100) + '...' || 'No snippet available.',
      }));
      allNewsItems.push(...newsItems);
    } catch (error) {
      const originalErrorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Throw an error to stop the entire ETL process, including the original reason
      throw new Error(`Failed to process feed from "${source.name}" (${source.url}). Reason: ${originalErrorMessage}. Please check if the URL is a valid RSS feed.`);
    }
  }

  return { news: allNewsItems };
}
