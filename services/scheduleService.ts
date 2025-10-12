const API_BASE_URL = 'http://localhost:3001/api';

export interface Schedule {
  cron: string;
  isEnabled: boolean;
}

export async function getSchedule(): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/schedule`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }
  return response.json();
}

export async function updateSchedule(schedule: Schedule): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(schedule),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update schedule');
  }
  return response.json();
}
