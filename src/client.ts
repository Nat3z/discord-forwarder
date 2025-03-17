import { Client, Events } from 'discord.js';
import { Config } from './config.js';
import { NtfyService } from './services/ntfy.js';

/**
 * Initialize and configure the Discord client
 */
export function setupClient(): Client {
  // Create a new client instance
  const client = new Client({
    intents: Config.intents,
  });

  // When the client is ready, run this code (only once)
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Listen for messages
  client.on(Events.MessageCreate, async (message) => {
    await NtfyService.forwardMessage(message);
  });

  return client;
} 