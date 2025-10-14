import React, { useState, useEffect, useMemo } from 'react';
import { LoadIcon, SendIcon, RefreshCwIcon, Edit2Icon, EyeIcon } from './icons';
import { ProcessStatus } from '../types';

// --- Helper Types and Components ---

interface ParsedArticle {
  title: string;
  url: string;
  summary: string;
  keywords: string[];
  sentiment: string;
}

const SentimentIndicator: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const sentimentData = useMemo(() => {
    if (sentiment.includes('Positive')) return { icon: '😊', text: 'Positive', color: 'text-green-400' };
    if (sentiment.includes('Negative')) return { icon: '😠', text: 'Negative', color: 'text-red-400' };
    return { icon: '😐', text: 'Neutral', color: 'text-slate-400' };
  }, [sentiment]);

  return (
    <div className={`flex items-center gap-2 text-sm ${sentimentData.color}`}>
      <span className="text-lg">{sentimentData.icon}</span>
      <span className="font-semibold">{sentimentData.text}</span>
    </div>
  );
};

const KeywordTag: React.FC<{ keyword: string }> = ({ keyword }) => (
  <span className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">
    {keyword}
  </span>
);

// --- Main Component ---

interface Props {
  initialSummary: string;
  status: ProcessStatus;
  onPost: (summary: string) => Promise<void>;
  onRegenerate: () => void;
  finalPostResult: string | null;
}

const ReviewAndLoadCard: React.FC<Props> = ({ initialSummary, status, onPost, onRegenerate, finalPostResult }) => {
  const [summary, setSummary] = useState(initialSummary);
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setSummary(initialSummary);
    setIsEditing(false); // Default to preview mode on new data
  }, [initialSummary]);

  const parsedArticles = useMemo((): ParsedArticle[] => {
    if (!summary) return [];
    const articleBlocks = summary.split('---').filter(block => block.trim() !== '');
    
    return articleBlocks.map(block => {
      const titleMatch = block.match(/\*<([^|]+)\|([^>]+)>\*/);
      const summaryMatch = block.match(/要約: ([^\n]+)/);
      const keywordsMatch = block.match(/キーワード: ([^\n]+)/);
      const sentimentMatch = block.match(/感情: ([^\n]+)/);

      return {
        url: titleMatch ? titleMatch[1] : '#',
        title: titleMatch ? titleMatch[2] : 'No Title',
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
        sentiment: sentimentMatch ? sentimentMatch[1].trim() : ''
      };
    });
  }, [summary]);

  const handlePost = async () => {
    setIsPosting(true);
    await onPost(summary);
    setIsPosting(false);
  };

  const isDone = status === 'success' || status === 'error';

  return (
    <div className={`bg-slate-800/50 rounded-lg p-6 border ${status === 'success' ? 'border-green-500/50' : 'border-slate-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${status === 'success' ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
            <LoadIcon className={`${status === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-200">3. Review & Load</h4>
            <p className="text-sm text-slate-400">Review, edit, and post the final summary to Slack.</p>
          </div>
        </div>
        {status === 'in-progress' && (
            <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                {isEditing ? <EyeIcon className="h-4 w-4" /> : <Edit2Icon className="h-4 w-4" />}
                {isEditing ? 'Preview' : 'Edit Raw Text'}
            </button>
        )}
      </div>

      {status !== 'pending' && (
        <div className="mt-4 pl-16">
          {isEditing ? (
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isDone}
              className="w-full h-72 bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-800 disabled:text-slate-400"
            />
          ) : (
            <div className="space-y-6">
              {parsedArticles.map((article, index) => (
                <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-cyan-400 hover:underline">{article.title}</a>
                  <p className="mt-2 text-slate-300">{article.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {article.keywords.map((kw, i) => <KeywordTag key={i} keyword={kw} />)}
                    </div>
                    <div className="flex-shrink-0">
                        <SentimentIndicator sentiment={article.sentiment} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            
          {!isDone && (
            <div className="flex items-center justify-end gap-4 mt-4">
              <button 
                onClick={onRegenerate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCwIcon className="h-4 w-4"/>
                Regenerate
              </button>
              <button 
                onClick={handlePost}
                disabled={isPosting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-500 transition-colors"
              >
                {isPosting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : (
                  <SendIcon className="h-4 w-4"/>
                )}
                Post to Slack
              </button>
            </div>
          )}

          {status === 'success' && finalPostResult && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-500/50 rounded-md text-green-300 text-sm">
              <strong>Success:</strong> {finalPostResult}
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-md text-red-300 text-sm">
              <strong>Error:</strong> Failed to post summary.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewAndLoadCard;
