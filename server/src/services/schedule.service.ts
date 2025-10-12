import * as cron from 'node-cron';
import { runEtlProcess } from './etl.service';
import { readDb, writeDb } from './db';

let scheduledTask: cron.ScheduledTask | null = null;

// Function to start the cron job based on the schedule in db.json
export async function initializeScheduler() {
  console.log('[Scheduler] Initializing...');
  const db = await readDb();
  const schedule = db.schedule;

  if (scheduledTask) {
    console.log('[Scheduler] Stopping existing task...');
    scheduledTask.stop();
    scheduledTask = null;
  }

  if (schedule && schedule.isEnabled && cron.validate(schedule.cron)) {
    console.log(`[Scheduler] Scheduling new task with cron: ${schedule.cron}`);
    scheduledTask = cron.schedule(schedule.cron, async () => {
      console.log(`[Scheduler] Running scheduled ETL process at ${new Date().toISOString()}`);
      try {
        await runEtlProcess();
        console.log('[Scheduler] Scheduled ETL process completed successfully.');
      } catch (error) {
        console.error('[Scheduler] Error during scheduled ETL process:', error);
      }
    });
  } else {
    console.log('[Scheduler] No valid schedule found or scheduler is disabled.');
  }
}

// Function to update the schedule and re-initialize the scheduler
export async function updateSchedule(cronExpression: string, isEnabled: boolean) {
  if (cronExpression && !cron.validate(cronExpression)) {
    throw new Error('Invalid cron expression.');
  }

  const db = await readDb();
  db.schedule = { cron: cronExpression, isEnabled };
  await writeDb(db);

  console.log('[Scheduler] Schedule updated. Re-initializing scheduler...');
  await initializeScheduler();

  return db.schedule;
}
