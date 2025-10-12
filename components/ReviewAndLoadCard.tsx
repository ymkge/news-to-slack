import React, { useState, useEffect } from 'react';
import { LoadIcon, SendIcon, RefreshCwIcon } from './icons';
import { ProcessStatus } from '../types';

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

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  const handlePost = async () => {
    setIsPosting(true);
    await onPost(summary);
    setIsPosting(false);
  };

  const isDone = status === 'success' || status === 'error';

  return (
    <div className={`bg-slate-800/50 rounded-lg p-6 border ${status === 'success' ? 'border-green-500/50' : 'border-slate-700'}`}>
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${status === 'success' ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
          <LoadIcon className={`${status === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-200">3. Review & Load</h4>
          <p className="text-sm text-slate-400">Review, edit, and post the final summary to Slack.</p>
        </div>
      </div>

      {status !== 'pending' && (
        <div className="mt-4 pl-16">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isDone}
              className="w-full h-48 bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-800 disabled:text-slate-400"
            />
            
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
