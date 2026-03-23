// single-server.js
import express from 'express';

const app = express();
const PORT = 3000;

// Mock API 1
app.get('/api/test1', (req, res) => {
  console.log("Test 1 init");
  res.json({
    mode: 'single',
    endpoint: '/api/test1',
    pid: process.pid,
    message: 'Handled by one single Node.js process',
  });
});

// Mock heavy route
app.get('/api/heavy', (req, res) => {
  console.log("Heavy Start ==>");
  let total = 0;
  for (let i = 0; i < 1e10; i++) {
    total += i;
  }
  total = 0;
  for (let i = 0; i < 1e10; i++) {
    total += i;
  }
  total = 0;
  for (let i = 0; i < 1e10; i++) {
    total += i;
  }
  console.log("Heavy End ==>");

  res.json({
    mode: 'client',
    endpoint: '/api/heavy',
    workerPid: process.pid,
    result: total,
    message: `Heavy computation blocked this single process while running. Result: ${total}`,
  });
});

app.listen(PORT, () => {
  console.log(`Single server running on http://localhost:${PORT}`);
  console.log(`PID: ${process.pid}`);
});