import { EtlStep, ProcessStatus } from '../types';

// The URL of the backend server. In a real-world application, 
// this would likely come from an environment variable.
const BACKEND_URL = 'http://localhost:3001';

type ProgressCallback = (step: EtlStep, status: ProcessStatus, data?: any) => void;

/**
 * Runs the entire ETL process by making a single call to the backend API.
 * The backend now orchestrates the Gemini API calls.
 * @param progressCallback - A function to report the progress of each ETL step.
 */
export const runEtlProcess = async (progressCallback: ProgressCallback) => {
  
  // The entire process is now handled by the backend. We will update the UI step-by-step.
  try {
    // Step 1: EXTRACT (as perceived by the frontend)
    // We start the process and immediately set the first step to 'in-progress'.
    progressCallback('extract', 'in-progress');

    const response = await fetch(`${BACKEND_URL}/api/run-etl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const results = await response.json();

    // Update UI with results from the backend
    progressCallback('extract', 'completed', results.extract);

    // Step 2: TRANSFORM
    progressCallback('transform', 'in-progress');
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    progressCallback('transform', 'completed', results.transform);

    // Step 3: LOAD
    progressCallback('load', 'in-progress');
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    progressCallback('load', 'completed', results.load);

  } catch (error) {
    console.error('An error occurred during the ETL process:', error);
    // Re-throw the error to be caught by the UI component
    throw error;
  }
};