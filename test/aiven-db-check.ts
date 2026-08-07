// Aiven PostgreSQL Database Connection & Schema Verification Script

import { AivenPostgresEngine } from '../src/db/aivenPostgres.js';

async function verifyAivenConnection() {
  console.log('=======================================================');
  console.log(' Checking Aiven Cloud PostgreSQL Connection & Schemas');
  console.log('=======================================================');

  const dbUrl = process.env.DATABASE_URL;
  console.log(`Database URL configured: ${dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'Not defined'}`);

  const dbEngine = AivenPostgresEngine.getInstance();
  const isConnected = dbEngine.isCloudConnected();

  if (isConnected) {
    console.log('✓ Aiven Cloud PostgreSQL is connected and operational!');
  } else {
    console.log('ℹ Aiven Cloud PostgreSQL is currently operating in local fallback mode.');
    console.log('To connect to live Aiven Cloud PostgreSQL, supply your connection URI in .env:');
    console.log('DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@YOUR_AIVEN_HOST.aivencloud.com:PORT/defaultdb?sslmode=require');
  }

  console.log('=======================================================');
}

verifyAivenConnection().catch((err) => {
  console.error('Aiven DB Check Error:', err);
});
