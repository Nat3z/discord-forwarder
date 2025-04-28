import { Client, RichPresence } from 'discord.js-selfbot-v13';
import { NtfyService } from './services/ntfy.js';

/**
 * Initialize and configure the Discord client
 */
export function setupClient(): Client {
  // Create a new client instance
  const client = new Client({
  });

  // When the client is ready, run this code (only once)
  client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  });

  // Listen for messages
  client.on('messageCreate', async (message) => {
    console.log("Received message", message.content);
    await NtfyService.forwardMessage(message, client);
  });


  return client;
} 

/**
 * Generate rich presence for the client
 */
export function generateRichPresence(client: Client): void {
  const richPresence = new RichPresence(client)
    .setName("Messages")
    .setType('LISTENING')
    .setDetails("Forwarding messages to Nat!")
    .setStartTimestamp(new Date())
    .setEndTimestamp(new Date(Date.now() + 1000 * 60 * 60 * 24))
  client.user?.setPresence({
    activities: [richPresence]
  });
}
