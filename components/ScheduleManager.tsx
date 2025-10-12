import React, { useState, useEffect, useCallback } from 'react';
import { getSchedule, updateSchedule, Schedule } from '../services/scheduleService';
import { ClockIcon, SaveIcon, AlertTriangleIcon } from './icons';

const ScheduleManager: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule>({ cron: '', isEnabled: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getSchedule()
      .then(data => {
        setSchedule(data);
      })
      .catch(() => setError('Failed to load schedule settings.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedSchedule = await updateSchedule(schedule);
      setSchedule(updatedSchedule);
      setSuccess('Schedule updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  }, [schedule]);

  const handleCronChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedule(prev => ({ ...prev, cron: e.target.value }));
  };

  const handleToggle = () => {
    setSchedule(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  if (isLoading) {
    return <div className="text-center text-slate-400">Loading schedule...</div>;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
        <ClockIcon />
        ETL Schedule
      </h3>
      <p className="text-sm text-slate-400 mt-1 mb-4">Set a schedule to run the ETL process automatically.</p>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded-md mb-4 text-sm flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-300 px-3 py-2 rounded-md mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-slate-300">Enable Automatic Execution</span>
        <label htmlFor="schedule-toggle" className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="schedule-toggle" className="sr-only peer" checked={schedule.isEnabled} onChange={handleToggle} />
          <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className={`transition-all duration-300 ${schedule.isEnabled ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <label htmlFor="cron-input" className="block text-sm font-medium text-slate-400 mb-1">Cron Expression</label>
        <input
          id="cron-input"
          type="text"
          value={schedule.cron}
          onChange={handleCronChange}
          placeholder="e.g., 0 9 * * * (every day at 9am)"
          className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={!schedule.isEnabled}
        />
        <p className="text-xs text-slate-500 mt-1">Uses standard cron syntax. The server timezone is used for scheduling.</p>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-5 w-5" />
              Save Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScheduleManager;
