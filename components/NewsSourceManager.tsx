import React, { useState, useEffect, useCallback } from 'react';
import { NewsSource } from '../types';
import { getAllNewsSources, createNewsSource, deleteNewsSource } from '../services/newsSourceService';

const NewsSourceManager: React.FC = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllNewsSources();
      setSources(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) {
      setError('Name and URL cannot be empty.');
      return;
    }

    try {
      const newSource = await createNewsSource(newName, newUrl);
      setSources([...sources, newSource]);
      setNewName('');
      setNewUrl('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }

    try {
      await deleteNewsSource(id);
      setSources(sources.filter(source => source.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
        <button 
          type="submit"
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Add Source
        </button>
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
              <button 
                onClick={() => handleDeleteSource(source.id)}
                className="px-2 py-1 text-red-400 hover:text-red-200"
                title="Delete Source"
              >
                &times;
              </button>
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
