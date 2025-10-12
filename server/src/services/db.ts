import fs from 'fs/promises';
import path from 'path';
import { DbData } from '@root/types';

const DB_PATH = path.join(__dirname, '..', '..', 'db.json');

const defaultDb: DbData = {
  newsSources: [],
  schedule: { cron: '', isEnabled: false },
};

export async function readDb(): Promise<DbData> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsedData = JSON.parse(data);
    // Ensure schedule object exists
    if (!parsedData.schedule) {
      parsedData.schedule = defaultDb.schedule;
    }
    return parsedData;
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'ENOENT') {
      return defaultDb;
    }
    console.error('Failed to read from DB:', e);
    throw e;
  }
}

export async function writeDb(data: DbData): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to DB:', error);
    throw error;
  }
}
