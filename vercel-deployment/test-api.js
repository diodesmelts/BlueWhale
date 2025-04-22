// Simple script to test API endpoints locally
// Run with: node test-api.js

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API handlers
import statusHandler from './api/status.js';
import competitionsHandler from './api/competitions.js';
import leaderboardHandler from './api/leaderboard.js';
import userStatsHandler from './api/user-stats.js';
import settingsHandler from './api/settings.js';

// Create a simple response object
const createResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(data) {
      this.body = JSON.stringify(data, null, 2);
      this.setHeader('Content-Type', 'application/json');
      return this;
    },
    end() {
      console.log(`Response (${this.statusCode}):`);
      console.log(this.body);
      return this;
    }
  };
  return res;
};

// Test each API endpoint
const testEndpoints = async () => {
  console.log('Testing API endpoints:\n');
  
  console.log('1. Status API:');
  await statusHandler({}, createResponse().end());
  
  console.log('\n2. Competitions API:');
  await competitionsHandler({}, createResponse().end());
  
  console.log('\n3. Leaderboard API:');
  await leaderboardHandler({}, createResponse().end());
  
  console.log('\n4. User Stats API:');
  await userStatsHandler({}, createResponse().end());
  
  console.log('\n5. Settings API:');
  await settingsHandler({}, createResponse().end());
  
  console.log('\nAll tests completed.');
};

// Run the tests
testEndpoints().catch(err => {
  console.error('Error testing endpoints:', err);
});