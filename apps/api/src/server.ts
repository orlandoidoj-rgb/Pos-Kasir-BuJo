// Load env FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';

// Manually set DATABASE_URL to handle special characters
process.env.DATABASE_URL = 'postgresql://warungbujo:BuJo2026SecurePass!@localhost:5432/warungbujo';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './index';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
