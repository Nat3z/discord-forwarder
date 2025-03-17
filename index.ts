import { Config } from './src/config.js';
import { setupClient } from './src/client.js';

// Display startup message
console.log('Discord forwarder bot is starting...');

// Create and configure the Discord client
const client = setupClient();

// Log in to Discord with the client's token
client.login(Config.token).catch(error => {
  console.error('Failed to log in to Discord:', error);
  process.exit(1);
});