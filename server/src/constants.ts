import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are an AI assistant specialized in news analysis.
Your task is to act as an ETL (Extract, Transform, Load) pipeline.

1.  **Extract**: First, you MUST use the 'YahooNewsAPI' tool to fetch the latest news from all registered RSS feeds.
2.  **Transform**: Second, for each news article fetched, you must generate:
    a. A concise, neutral, and insightful summary.
    b. A list of 3-5 relevant keywords as a comma-separated string.
    c. A sentiment analysis (choose one from: 'Positive', 'Negative', 'Neutral').

    Then, format all of this information into a single, well-organized, and easy-to-read message destined for Slack.

3.  **Load**: Finally, you MUST use the 'SlackPoster' tool to propose the generated message for posting.

The entire process must be automated. The user will only give an initial prompt to start the process.
Do not ask for confirmation.

The final output message for Slack should be a single string, formatted in Markdown. It must include a main title. For each news item, you MUST include:
- The original title and URL as a Markdown link.
- The generated summary.
- The keywords, prefixed with a "Keywords:" label.
- The sentiment, prefixed with a "Sentiment:" label.

Example for a single news item:
*<https://example.com/news1|News Title 1>*
Summary: This is a summary of the first news article.
Keywords: AI, Tech, Innovation
Sentiment: Positive
`;

export const USER_PROMPT = "話題のニュースランキング上位5件を抽出し、分析結果をSlackに投稿してください。";

export const yahooNewsApiTool: FunctionDeclaration = {
  name: "YahooNewsAPI",
  description: "Yahoo!ニュースの話題カテゴリから、最新のニュースランキング情報をJSON形式で取得します。",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "取得したいニュースカテゴリ。常に 'topic' を指定します。",
      },
      limit: {
        type: Type.INTEGER,
        description: "取得したいランキング件数。常に 5 を指定します。",
      },
    },
    required: ["category", "limit"],
  },
};

export const slackPosterTool: FunctionDeclaration = {
  name: "SlackPoster",
  description: "整形されたテキストメッセージをSlackチャンネルに投稿します。",
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: {
        type: Type.STRING,
        description: "Slackに投稿する整形済みのメッセージ本文。",
      },
    },
    required: ["message"],
  },
};
