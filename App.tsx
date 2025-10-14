import React, { useReducer, useCallback } from 'react';
import { generateSummary, postSummary } from './services/geminiService';
import { EtlStep, ProcessStatus, EtlData } from './types';
import ProcessStepCard from './components/ProcessStepCard';
import { ExtractIcon, TransformIcon, ZapIcon, AlertTriangleIcon } from './components/icons';
import NewsSourceManager from './components/NewsSourceManager';
import ScheduleManager from './components/ScheduleManager';
import ReviewAndLoadCard from './components/ReviewAndLoadCard';

// 1. Define State, Actions, and Initial State for the reducer

interface State {
  statuses: Record<EtlStep, ProcessStatus>;
  data: EtlData;
  isGenerating: boolean;
  error: string | null;
}

type Action =
  | { type: 'RESET' }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { extract: any; transform: any; summary: string } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'POST_START' }
  | { type: 'POST_SUCCESS'; payload: string }
  | { type: 'POST_ERROR' };

const initialState: State = {
  statuses: {
    extract: 'pending',
    transform: 'pending',
    review: 'pending',
    load: 'pending',
  },
  data: {
    extract: null,
    transform: null,
    summary: '',
    load: '',
  },
  isGenerating: false,
  error: null,
};

// 2. Create the reducer function

const etlReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'RESET':
      return {
        ...initialState,
      };
    case 'GENERATE_START':
      return {
        ...initialState, // Reset on new generation
        isGenerating: true,
        statuses: { ...initialState.statuses, extract: 'in-progress' },
      };
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        statuses: { ...state.statuses, extract: 'success', transform: 'success', review: 'in-progress' },
        data: { ...state.data, ...action.payload },
      };
    case 'GENERATE_ERROR':
      return {
        ...state,
        isGenerating: false,
        error: action.payload,
        statuses: { ...state.statuses, extract: 'error', transform: 'error' },
      };
    case 'POST_START':
      return {
        ...state,
        statuses: { ...state.statuses, load: 'in-progress' },
      };
    case 'POST_SUCCESS':
      return {
        ...state,
        statuses: { ...state.statuses, load: 'success', review: 'success' },
        data: { ...state.data, load: action.payload },
      };
    case 'POST_ERROR':
      return {
        ...state,
        statuses: { ...state.statuses, load: 'error', review: 'error' },
      };
    default:
      return state;
  }
};

const App: React.FC = () => {
  // 3. Replace useState with useReducer
  const [state, dispatch] = useReducer(etlReducer, initialState);

  // 4. Update event handlers to dispatch actions
  const handleGenerateSummary = useCallback(async () => {
    dispatch({ type: 'GENERATE_START' });

    try {
      const result = await generateSummary();
      dispatch({ 
        type: 'GENERATE_SUCCESS', 
        payload: { extract: result.extract, transform: result.transform, summary: result.summary }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      dispatch({ type: 'GENERATE_ERROR', payload: `Process failed: ${errorMessage}` });
    }
  }, []);

  const handlePostSummary = useCallback(async (summary: string) => {
    dispatch({ type: 'POST_START' });
    try {
      const result = await postSummary(summary);
      dispatch({ type: 'POST_SUCCESS', payload: result.message });
    } catch (err) {
      dispatch({ type: 'POST_ERROR' });
      console.error(err);
    }
  }, []);

  // The custom hook refactoring is implicitly handled by centralizing logic in the reducer.
  // For this app's scale, creating separate `useApi` hooks would be overkill, 
  // as the reducer already separates state logic from the component's view logic.

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
              disabled={state.isGenerating}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              {state.isGenerating ? (
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

          {state.error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
               <AlertTriangleIcon className="h-5 w-5 text-red-400" />
              <span className="block sm:inline">{state.error}</span>
            </div>
          )}

          <div className="space-y-6">
            <ProcessStepCard
              icon={<ExtractIcon />}
              title="1. Extract"
              description="Fetch news articles from configured RSS feeds."
              status={state.statuses.extract}
              content={state.data.extract ? JSON.stringify(state.data.extract, null, 2) : null}
              contentType="json"
            />
            <ProcessStepCard
              icon={<TransformIcon />}
              title="2. Transform"
              description="Gemini analyzes news and generates a summary for review."
              status={state.statuses.transform}
              content={state.data.transform ? JSON.stringify(state.data.transform, null, 2) : null}
              contentType="json"
            />
            <ReviewAndLoadCard 
              status={state.statuses.review}
              initialSummary={state.data.summary}
              onPost={handlePostSummary}
              onRegenerate={handleGenerateSummary}
              finalPostResult={state.data.load}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
