import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are an AI assistant specialized in news analysis.
Your task is to act as an ETL (Extract, Transform, Load) pipeline.

1.  **Extract**: First, you MUST use the 'YahooNewsAPI' tool to fetch the latest news from all registered RSS feeds.
2.  **Transform**: Second, analyze the fetched news content. For each article, generate a summary, 3-5 keywords, and a sentiment ('Positive', 'Negative', 'Neutral').
3.  **Load**: Finally, combine all the analyzed information into a single Markdown-formatted string and you MUST call the 'SlackPoster' tool with this string as the 'message' argument.

**Formatting Rules for the final message:**
- Include a main title.
- For each news item, you MUST include:
  - The original title and URL as a Markdown link.
  - The generated summary.
  - The keywords, prefixed with a "Keywords:" label.
  - The sentiment, prefixed with a "Sentiment:" label.

Example for one item:
*<https://example.com/news1|News Title 1>*
Summary: This is a summary of the first news article.
Keywords: AI, Tech, Innovation
Sentiment: Positive

Do not ask for confirmation. Proceed with the ETL process as soon as you are prompted.
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
