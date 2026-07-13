// Credit Book — Server Entry Point
require('dotenv').config();

const app = require('./src/app');
const { startJobs } = require('./src/jobs/scheduler');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Credit Book API running at http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL}`);
  console.log(`\n📋 Routes:`);
  console.log(`   POST /api/v1/auth/register`);
  console.log(`   POST /api/v1/auth/login`);
  console.log(`   GET  /api/v1/persons`);
  console.log(`   GET  /health\n`);

  // Start background jobs
  startJobs();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
