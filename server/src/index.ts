import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import newsRoutes from './routes/news';
import etlRoutes from './routes/etl';

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
app.use('/api/run-etl', etlRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});