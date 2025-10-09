import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
