import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🚀 Scan. Pay. Go. Backend Server running on port ${PORT}`);
  console.log(` 🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(` 📡 Base API: http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
