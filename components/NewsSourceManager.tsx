import React, { useState, useEffect } from 'react';
import { NewsSource } from '../types';

const API_URL = 'http://localhost:3001/api';

const NewsSourceManager: React.FC = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/news-sources`);
      if (!response.ok) {
        throw new Error('Failed to fetch news sources.');
      }
      const data: NewsSource[] = await response.json();
      setSources(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) {
      setError('Name and URL cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/news-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName, url: newUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to add news source.');
      }

      const newSource = await response.json();
      setSources([...sources, newSource]);
      setNewName('');
      setNewUrl('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/news-sources/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news source.');
      }

      setSources(sources.filter(source => source.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Manage News Sources</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleAddSource} style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Source Name (e.g., Google News)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ width: '300px', marginRight: '0.5rem', color: '#333' }}
            />
            <input
              type="url"
              placeholder="RSS Feed URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ width: '400px', marginRight: '0.5rem', color: '#333' }}
            />
        </div>
        <button type="submit">Add Source</button>
      </form>

      {isLoading ? (
        <p>Loading sources...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sources.map(source => (
            <li key={source.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span>
                <strong>{source.name}</strong>: <small>{source.url}</small>
              </span>
              <button onClick={() => handleDeleteSource(source.id)}>&times;</button>
            </li>
          ))}
        </ul>
      )}
       { !isLoading && sources.length === 0 && (
          <p>No news sources configured yet. Add one above to get started.</p>
      )}
    </div>
  );
};

export default NewsSourceManager;
