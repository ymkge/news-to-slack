import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Parser from 'rss-parser';
import fetch from 'node-fetch';

import {
  SYSTEM_INSTRUCTION,
  USER_PROMPT,
  yahooNewsApiTool,
  slackPosterTool,
} from './constants';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- CORS Configuration ---
// Note: In a production environment, it's recommended to restrict the origin
// to the specific domain of your frontend application.
app.use(cors()); 
app.use(express.json());

// --- Gemini AI Initialization ---
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

// --- RSS Parser Initialization ---
const parser = new Parser();

/**
 * Fetches news from Yahoo! News RSS feed and formats it.
 * @returns Formatted news data.
 */
async function fetchYahooNews() {
  const YAHOO_NEWS_RSS_URL = 'https://news.yahoo.co.jp/rss/topics/top-picks.xml';
  try {
    const feed = await parser.parseURL(YAHOO_NEWS_RSS_URL);
    const newsItems = feed.items.slice(0, 5).map(item => ({
      title: item.title || 'No Title',
      url: item.link || '#',
      snippet: item.contentSnippet ? item.contentSnippet.substring(0, 100) + '...' : 'No snippet available.',
    }));
    return { news: newsItems };
  } catch (error) {
    console.error('Failed to fetch Yahoo News RSS:', error);
    throw new Error('Failed to fetch Yahoo News.');
  }
}

/**
 * Posts a message to Slack using a webhook URL.
 * @param message The message to post.
 */
async function postToSlack(message: string) {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    console.warn('SLACK_WEBHOOK_URL is not set. Skipping Slack post.');
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

/**
 * Endpoint to run the main ETL process.
 * It orchestrates the calls to the Gemini API to perform the Extract, Transform, and Load steps.
 */
app.post('/api/run-etl', async (req, res) => {
  console.log('Received request for /api/run-etl');
  try {
    // === Part 1: Initial call to get the first function call (YahooNewsAPI) ===
    console.log('Step 1: Calling Gemini to get news function call...');
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
    console.log('Step 1: Success. Received YahooNewsAPI function call.');

    // === Part 2: Fetch real news and send data back to the model ===
    console.log('Step 2: Fetching real Yahoo News data...');
    const yahooNewsData = await fetchYahooNews();
    console.log('Step 2: Real Yahoo News data fetched.', yahooNewsData);

    console.log('Step 2: Calling Gemini with real news data for transformation...');
    
    const functionResponsePart = {
        functionResponse: {
          name: 'YahooNewsAPI',
          response: {
            content: JSON.stringify(yahooNewsData),
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
    console.log('Step 2: Success. Received SlackPoster function call.');

    // === Part 3: Extract final message and post to Slack ===
    const slackMessage = secondFunctionCall.args.message;
    if (!slackMessage) {
      console.error("Error: Slack message was not generated by the model.");
      return res.status(500).json({ error: "Slack message was not generated by the model." });
    }
    console.log('Step 3: Extracted Slack message. Attempting to post to Slack...');
    await postToSlack(slackMessage); // Slackに実際に投稿
    console.log('Step 3: Slack post attempt completed.');

    res.json({
      extract: yahooNewsData,
      transform: {
        description: "Gemini has analyzed the news and generated the final Slack message.",
        functionCall: secondFunctionCall
      },
      load: slackMessage,
    });

  } catch (error) {
    console.error('Error during ETL process:', error);
    res.status(500).json({ error: 'An error occurred during the ETL process.' });
  }
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});