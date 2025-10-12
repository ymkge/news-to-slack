import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import newsRoutes from './routes/news';
import etlRoutes from './routes/etl';
import scheduleRoutes from './routes/schedule'; // Import new schedule routes
import { initializeScheduler } from './services/schedule.service'; // Import scheduler initializer

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json());

// --- API Endpoints ---
app.get('/api', (req, res) => {
  res.send('Hello from backend!');
});

app.use('/api/news-sources', newsRoutes);
app.use('/api/etl', etlRoutes); // Use new schedule routes
app.use('/api/schedule', scheduleRoutes); // Use new schedule routes

// --- Error Handling ---
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  // Initialize the scheduler when the server starts
  initializeScheduler();
});
