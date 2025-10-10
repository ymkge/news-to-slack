import { EtlStep, ProcessStatus } from '../types';

const BACKEND_URL = 'http://localhost:3001';

type ProgressCallback = (step: EtlStep, status: ProcessStatus, data?: any) => void;

/**
 * Runs the entire ETL process by making a single call to the backend API.
 * The backend now orchestrates the Gemini API calls.
 * @param progressCallback - A function to report the progress of each ETL step.
 */
export const runEtlProcess = async (progressCallback: ProgressCallback) => {
  try {
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

    progressCallback('extract', 'completed', results.extract);

    progressCallback('transform', 'in-progress');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay for UX
    progressCallback('transform', 'completed', results.transform);

    progressCallback('load', 'in-progress');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay for UX
    progressCallback('load', 'completed', results.load);

  } catch (error) {
    console.error('An error occurred during the ETL process:', error);
    throw error;
  }
};
