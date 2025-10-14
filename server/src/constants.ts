import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are a news processing pipeline. Your workflow is as follows:

1.  Call the 'YahooNewsAPI' tool to get news.
2.  Analyze the news you receive. For each article, you will write:
    - A summary.
    - A "Keywords:" line with 3-5 keywords.
    - A "Sentiment:" line with 'Positive', 'Negative', or 'Neutral'.
3.  Format all the analyzed articles into a single Markdown string. The format for each article must be:
    *<https://example.com/news1|News Title 1>*
    Summary: This is a summary of the first news article.
    Keywords: AI, Tech, Innovation
    Sentiment: Positive
4.  You MUST call the 'SlackPoster' tool. The 'message' parameter of this tool MUST be the Markdown string you just created.

Your final response MUST be a call to the 'SlackPoster' tool. Do not respond with text.
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