import { NewsSource } from '../types';

const API_URL = 'http://localhost:3001/api/news-sources';

export const getAllNewsSources = async (): Promise<NewsSource[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error('Failed to fetch news sources.');
    }
    return response.json();
};

export const createNewsSource = async (name: string, url: string): Promise<NewsSource> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url }),
    });
    if (!response.ok) {
        throw new Error('Failed to add news source.');
    }
    return response.json();
};

export const deleteNewsSource = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete news source.');
    }
};
