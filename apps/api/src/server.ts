// Load env FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './index';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
