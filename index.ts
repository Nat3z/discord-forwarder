import { Config } from './src/config.js';
import { generateRichPresence, setupClient } from './src/client.js';
import { setupWebServer } from './src/webserver.js';

// Display startup message
console.log('Discord forwarder bot is starting...');

// Create and configure the Discord client
const client = setupClient();

// Log in to Discord with the client's token
client.login(Config.token).then(() => {
  console.log('Successfully logged in to Discord');
  
  // Generate rich presence (uncomment if needed)
  // generateRichPresence(client);
  
  // Start the web server
  setupWebServer(client);
}).catch(error => {
  console.error('Failed to log in to Discord:', error);
  process.exit(1);
});