import fs from 'fs/promises';
import path from 'path';
import { NewsSource } from '@root/types';

const DB_PATH = path.join(__dirname, '..', '..', 'db.json');

export async function readDb(): Promise<{ newsSources: NewsSource[] }> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    // If file doesn't exist, return default structure
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') {
      return { newsSources: [] };
    }
    console.error('Failed to read from DB:', e);
    throw e;
  }
}

export async function writeDb(data: { newsSources: NewsSource[] }) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to DB:', error);
    throw error;
  }
}
