import express from 'express';
import { readDb } from '../services/db';
import { updateSchedule } from '../services/schedule.service';

const router = express.Router();

// GET /api/schedule - Get the current schedule
router.get('/', async (req, res) => {
  try {
    const { schedule } = await readDb();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read schedule' });
  }
});

// POST /api/schedule - Update the schedule
router.post('/', async (req, res) => {
  const { cron, isEnabled } = req.body;

  if (typeof isEnabled !== 'boolean') {
    return res.status(400).json({ error: 'isEnabled must be a boolean.' });
  }
  if (isEnabled && typeof cron !== 'string') {
    return res.status(400).json({ error: 'cron must be a string when enabled.' });
  }

  try {
    const newSchedule = await updateSchedule(cron, isEnabled);
    res.json(newSchedule);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: `Failed to update schedule: ${errorMessage}` });
  }
});

export default router;
