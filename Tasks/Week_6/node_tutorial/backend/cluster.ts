// cluster-server.js
import cluster from 'cluster';
import os from 'os';
import express from 'express';

cluster.schedulingPolicy = cluster.SCHED_RR; // forced rr
const PORT = 4000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process started. PID: ${process.pid}`);
  console.log(`Creating ${numCPUs} workers...\n`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

}
else {
  const app = express();

  // Mock API 1
  app.get('/api/test1', (req, res) => {
    res.json({
      mode: 'cluster',
      endpoint: '/api/test1',
      workerPid: process.pid,
      message: 'Handled by one worker process in the cluster',
    });
  });
  
  // Mock heavy route
  app.get('/api/heavy', (req, res) => {
    console.log("Heavy Start ==>");
    let total = 0;
    for (let i = 0; i < 1e10; i++) {
      total += i;
    }
    let total2 = 0;
    for (let i = 0; i < 1e10; i++) {
      total2 += i;
    }
    let total3 = 0;
    for (let i = 0; i < 1e10; i++) {
      total3 += i;
    }
    console.log("Heavy End ==>");

    res.json({
      mode: 'cluster',
      endpoint: '/api/heavy',
      workerPid: process.pid,
      result: total,
      message: `Only this worker got blocked, other workers can still serve requests`,
    });
  });


  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on http://localhost:${PORT}`);
  });
}