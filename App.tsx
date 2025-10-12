import React, { useState, useCallback } from 'react';
import { generateSummary, postSummary } from './services/geminiService';
import { EtlStep, ProcessStatus } from './types';
import ProcessStepCard from './components/ProcessStepCard';
import { ExtractIcon, TransformIcon, ZapIcon, AlertTriangleIcon } from './components/icons';
import NewsSourceManager from './components/NewsSourceManager';
import ScheduleManager from './components/ScheduleManager';
import ReviewAndLoadCard from './components/ReviewAndLoadCard';

const App: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<EtlStep, ProcessStatus>>({
    extract: 'pending',
    transform: 'pending',
    review: 'pending',
    load: 'pending',
  });
  const [data, setData] = useState<Record<string, any>>({
    extract: null,
    transform: null,
    summary: null,
    load: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setError(null);
    setStatuses({ extract: 'pending', transform: 'pending', review: 'pending', load: 'pending' });
    setData({ extract: null, transform: null, summary: null, load: null });
  }

  const handleGenerateSummary = useCallback(async () => {
    resetState();
    setIsGenerating(true);

    try {
      setStatuses(prev => ({ ...prev, extract: 'in-progress' }));
      const result = await generateSummary();
      
      setStatuses(prev => ({ ...prev, extract: 'success', transform: 'in-progress' }));
      setData(prev => ({ ...prev, extract: result.extract, transform: result.transform, summary: result.summary }));
      
      // Simulate transform step for UX
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, transform: 'success', review: 'in-progress' }));
      }, 300);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Process failed: ${errorMessage}`);
      setStatuses(prev => ({ ...prev, extract: 'error', transform: 'error' }));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handlePostSummary = useCallback(async (summary: string) => {
    setStatuses(prev => ({ ...prev, load: 'in-progress' }));
    try {
      const result = await postSummary(summary);
      setData(prev => ({ ...prev, load: result.message }));
      setStatuses(prev => ({ ...prev, load: 'success', review: 'success' }));
    } catch (err) {
      setStatuses(prev => ({ ...prev, load: 'error', review: 'error' }));
      console.error(err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI ETL Agent
          </h1>
          <p className="mt-2 text-lg text-slate-400">RSS Feeds → Gemini AI Analysis → Slack Post</p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <NewsSourceManager />
            <ScheduleManager />
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <ZapIcon className="h-5 w-5" />
                  Generate Summary
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
               <AlertTriangleIcon className="h-5 w-5 text-red-400" />
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <ProcessStepCard
              icon={<ExtractIcon />}
              title="1. Extract"
              description="Fetch news articles from configured RSS feeds."
              status={statuses.extract}
              content={data.extract ? JSON.stringify(data.extract, null, 2) : null}
              contentType="json"
            />
            <ProcessStepCard
              icon={<TransformIcon />}
              title="2. Transform"
              description="Gemini analyzes news and generates a summary for review."
              status={statuses.transform}
              content={data.transform ? JSON.stringify(data.transform, null, 2) : null}
              contentType="json"
            />
            <ReviewAndLoadCard 
              status={statuses.review}
              initialSummary={data.summary || ''}
              onPost={handlePostSummary}
              onRegenerate={handleGenerateSummary}
              finalPostResult={data.load}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;