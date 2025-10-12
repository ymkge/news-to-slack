import express from 'express';
import { runEtlProcess, generateSummary, postToSlack } from '../services/etl.service';

const router = express.Router();

// --- New endpoints for interactive UI ---

// POST /api/etl/generate-summary - Step 1 & 2: Extract and Transform
router.post('/generate-summary', async (req, res) => {
    try {
        const result = await generateSummary();
        res.json(result);
    } catch (error) {
        console.error('[ETL Generate Summary Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: errorMessage });
    }
});

// POST /api/etl/post-summary - Step 3: Load
router.post('/post-summary', async (req, res) => {
    const { summary } = req.body;
    if (typeof summary !== 'string' || !summary) {
        return res.status(400).json({ error: 'Summary must be a non-empty string.' });
    }
    try {
        const result = await postToSlack(summary);
        res.json({ message: result, summary });
    } catch (error) {
        console.error('[ETL Post Summary Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: errorMessage });
    }
});


// --- Endpoint for scheduled (non-interactive) execution ---

// POST /api/etl/run-full-process - Runs all steps sequentially
router.post('/run-full-process', async (req, res) => {
    try {
        const result = await runEtlProcess();
        res.json(result);
    } catch (error) {
        console.error('[ETL Full Process Error]', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the ETL process.';
        res.status(500).json({ error: errorMessage });
    }
});

export default router;
