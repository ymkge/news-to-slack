import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Parser from 'rss-parser';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

import {
  SYSTEM_INSTRUCTION,
  USER_PROMPT,
  yahooNewsApiTool,
  slackPosterTool,
} from './constants';
import { NewsSource } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const DB_PATH = path.join(__dirname, '..', 'db.json');

app.use(cors()); 
app.use(express.json());

// --- DB Utility Functions ---
async function readDb(): Promise<{ newsSources: NewsSource[] }> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    // If file doesn't exist, return default structure
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') {
      return { newsSources: [] };
    }
    console.error('Failed to read from DB:', e);
    throw e;
  }
}

async function writeDb(data: { newsSources: NewsSource[] }) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to DB:', error);
    throw error;
  }
}


// --- Gemini AI Initialization ---
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

// --- RSS Parser Initialization ---
const parser = new Parser();

/**
 * Fetches news from all registered RSS feeds and formats them.
 * Throws an error if any of the RSS feeds fail to parse.
 * @returns Formatted news data.
 */
async function fetchAllNews() {
  const { newsSources } = await readDb();
  if (newsSources.length === 0) {
    console.warn("No news sources configured.");
    return { news: [] };
  }

  const allNewsItems: any[] = [];

  for (const source of newsSources) {
    try {
      const feed = await parser.parseURL(source.url);
      const newsItems = feed.items.slice(0, 5).map(item => ({
        title: item.title || 'No Title',
        url: item.link || '#',
        snippet: item.contentSnippet?.substring(0, 100) + '...' || 'No snippet available.',
      }));
      allNewsItems.push(...newsItems);
    } catch (error) {
      console.error(`Failed to fetch RSS feed from ${source.name} (${source.url}):`, error);
      // Throw an error to stop the entire ETL process
      throw new Error(`Failed to fetch news from "${source.name}" (${source.url}). Please check if the URL is a valid RSS feed.`);
    }
  }

  return { news: allNewsItems };
}


/**
 * Posts a message to Slack using a webhook URL.
 * @param message The message to post.
 */
async function postToSlack(message: string) {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL is not set. Skipping actual Slack post.');
    return;
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to post to Slack: ${response.status} - ${errorText}`);
      throw new Error(`Failed to post to Slack: ${response.status}`);
    }
    console.log('Message successfully posted to Slack.');
  } catch (error) {
    console.error('Error posting to Slack:', error);
    throw new Error('Error posting to Slack.');
  }
}

// --- API Endpoints ---
app.get('/api', (req, res) => {
  res.send('Hello from backend!');
});

// --- News Sources API ---
app.get('/api/news-sources', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.newsSources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve news sources.' });
  }
});

app.post('/api/news-sources', async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required.' });
    }
    const db = await readDb();
    const newSource: NewsSource = { id: crypto.randomUUID(), name, url };
    db.newsSources.push(newSource);
    await writeDb(db);
    res.status(201).json(newSource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add new source.' });
  }
});

app.delete('/api/news-sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const initialLength = db.newsSources.length;
    db.newsSources = db.newsSources.filter(source => source.id !== id);
    if (db.newsSources.length === initialLength) {
        return res.status(404).json({ error: 'News source not found.' });
    }
    await writeDb(db);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news source.' });
  }
});


/**
 * Endpoint to run the main ETL process.
 * It orchestrates the calls to the Gemini API to perform the Extract, Transform, and Load steps.
 */
app.post('/api/run-etl', async (req, res) => {
  try {
    // === Part 1: Initial call to get the first function call (YahooNewsAPI) ===
    const tools = [{ functionDeclarations: [yahooNewsApiTool, slackPosterTool] }];
    
    let response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { role: 'user', parts: [{ text: USER_PROMPT }] },
      config: {
          systemInstruction: { role: 'model', parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools,
      },
    });

    const firstFunctionCall = response.functionCalls?.[0];
    if (!firstFunctionCall || firstFunctionCall.name !== 'YahooNewsAPI') {
      console.error("Error: Expected a function call to YahooNewsAPI.", response);
      return res.status(500).json({ error: "Expected a function call to YahooNewsAPI, but didn't receive one." });
    }

    // === Part 2: Fetch real news and send data back to the model ===
    const newsData = await fetchAllNews();
    
    const functionResponsePart = {
        functionResponse: {
          name: 'YahooNewsAPI',
          response: {
            content: JSON.stringify(newsData),
          },
        },
      };
      
    const chatHistory = [
        { role: 'user', parts: [{ text: USER_PROMPT }] },
        { role: 'model', parts: [{ functionCall: firstFunctionCall }] },
    ];

    response = await ai.models.generateContent({
      model,
      contents: [ ...chatHistory, { role: 'function', parts: [ functionResponsePart ] }],
      config: {
          systemInstruction: { role: 'model', parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools,
      },
    });

    const secondFunctionCall = response.functionCalls?.[0];
    if (!secondFunctionCall || secondFunctionCall.name !== 'SlackPoster') {
      console.error("Error: Expected a function call to SlackPoster, but didn't receive one.", response);
      return res.status(500).json({ error: "Expected a function call to SlackPoster, but didn't receive one." });
    }

    // === Part 3: Extract final message and post to Slack ===
    const slackMessage = secondFunctionCall.args?.message;
    if (typeof slackMessage !== 'string' || !slackMessage) {
      console.error("Error: Slack message was not generated by the model or is not a string.");
      return res.status(500).json({ error: "Slack message was not generated by the model or is not a string." });
    }
    await postToSlack(slackMessage);

    res.json({
      extract: newsData,
      transform: {
        description: "Gemini has analyzed the news and generated the final Slack message.",
        functionCall: secondFunctionCall
      },
      load: slackMessage,
    });

  } catch (error) {
    console.error('Error during ETL process:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the ETL process.';
    res.status(500).json({ error: errorMessage });
  }
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
