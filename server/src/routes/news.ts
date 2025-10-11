import express from 'express';
import crypto from 'crypto';
import { readDb, writeDb } from '../services/db';
import { NewsSource } from '@root/types';

const router = express.Router();

// GET /api/news-sources
router.get('/', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.newsSources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve news sources.' });
  }
});

// POST /api/news-sources
router.post('/', async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required.' });
    }
    const db = await readDb();
    const newSource: NewsSource = { id: crypto.randomUUID(), name, url };
    db.newsSources.push(newSource);
    await writeDb(db);
    res.status(201).json(newSource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add new source.' });
  }
});

// DELETE /api/news-sources/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    const initialLength = db.newsSources.length;
    db.newsSources = db.newsSources.filter(source => source.id !== id);
    if (db.newsSources.length === initialLength) {
        return res.status(404).json({ error: 'News source not found.' });
    }
    await writeDb(db);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news source.' });
  }
});

export default router;
