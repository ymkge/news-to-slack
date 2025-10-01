<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI ETL Agent: News to Slack

このアプリケーションは、ニュース記事を取得し、Gemini AI を使って分析・要約し、その結果をSlackに投稿する、という一連のETL (Extract, Transform, Load) プロセスを可視化するためのデモアプリケーションです。

AI Studioでこのアプリを見る: https://ai.studio/apps/drive/11Vwu7xVOHsMmfslq1c8vJMcJj_0enz-P

## 概要

「Run ETL Process」ボタンをクリックすると、以下の処理が実行され、各ステップの進捗と結果がリアルタイムで画面に表示されます。

1.  **Extract (抽出)**: Yahoo!ニュースから最新のトップニュース5件を模擬的に取得します。
2.  **Transform (変換)**: Google Gemini API を利用して、取得したニュース記事を分析し、「トピック分類」と「内容の要約」を生成します。
3.  **Load (書き出し)**: 分析結果をSlackのメッセージ形式に整形し、Slackへの投稿をシミュレートします。

## 処理フロー

```mermaid
graph TD
    subgraph "ユーザー操作"
        A("「Run ETL Process」ボタンをクリック")
    end

    subgraph "ETLプロセス"
        B["1. Extract (抽出)<br>Yahoo!ニュースの記事を取得 (Mock)"]
        C["2. Transform (変換)<br>Gemini AIで記事を分析・要約"]
        D["3. Load (書き出し)<br>Slackメッセージを生成・投稿 (Simulate)"]
    end

    subgraph "結果"
        E("UIに進捗と結果を表示")
    end

    A --> B --> C --> D --> E
```

## 主な使用技術

-   **フロントエンド**: React, TypeScript
-   **ビルドツール**: Vite
-   **AI**: Google Gemini API (`@google/genai`)
-   **UI**: Tailwind CSS

## ローカルでの実行方法

**前提条件:**

-   [Node.js](https://nodejs.org/) がインストールされていること。
-   Google Gemini API キーを取得していること。

**手順:**

1.  **依存関係のインストール:**
    ```bash
    npm install
    ```

2.  **APIキーの設定:**
    プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下のようにご自身のGemini APIキーを設定してください。

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

3.  **開発サーバーの起動:**
    ```bash
    npm run dev
    ```

4.  ブラウザで `http://localhost:5173` （またはターミナルに表示されたアドレス）にアクセスすると、アプリケーションが表示されます。