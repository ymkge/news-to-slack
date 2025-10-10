import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `あなたは、ニュースヘッドライン分析ボットです。ユーザーからの指示に基づき、以下の手順でタスクを完了してください。

**【タスク実行手順】**
1.  **「YahooNewsAPI」** ツールを使用して、日本のYahoo!ニュースの「話題」カテゴリの**ランキング上位5件**のニュース情報を抽出します。
2.  抽出した情報（タイトル、URL、簡潔な概要）を分析し、**各ニュースがどのようなトピック**（政治、経済、エンタメなど）に関するものかを分類し、分析結果を生成します。
3.  最終的に、抽出・分析した上位5件のニュース情報を、指定された**「SlackPoster」** ツールを使用してSlackチャンネルに投稿するための整形済みテキストとして出力します。
4.  Slack投稿テキストは、各ニュースについて以下のフォーマットを必ず含めてください:
    *  '【ランキング [順位]】 [ニュースタイトル]'
    *  '[分析されたトピック]： [概要（30文字以内）]'
    *  'URL: [ニュースURL]'
    * 5件のニュースの後に、最後に「今日の話題ニュース分析を完了しました。」という締めのメッセージを追加してください。

**【出力形式の制約】**
* 最終出力は、必ず「SlackPoster」Function Callingの引数として渡すテキストメッセージとしてください。
* ユーザーからの指示がない限り、追加の会話や説明は不要です。`;

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
