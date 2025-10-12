const API_BASE_URL = 'http://localhost:3001/api/etl';

/**
 * Calls the backend to perform the Extract and Transform steps.
 * @returns The result containing extracted data and the generated summary.
 */
export async function generateSummary() {
  const response = await fetch(`${API_BASE_URL}/generate-summary`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to generate summary with no error details.' }));
    throw new Error(errorData.error || 'Failed to generate summary');
  }

  return response.json();
}

/**
 * Calls the backend to post the (potentially edited) summary to Slack.
 * @param summary The final summary text to post.
 * @returns The confirmation from the backend.
 */
export async function postSummary(summary: string) {
  const response = await fetch(`${API_BASE_URL}/post-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ summary }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to post summary with no error details.' }));
    throw new Error(errorData.error || 'Failed to post summary');
  }

  return response.json();
}