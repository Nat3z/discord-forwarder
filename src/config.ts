import { config } from 'dotenv';
import { GatewayIntentBits } from 'discord.js';

// Load environment variables
config();

// Configuration object
export const Config = {
  // Discord bot token
  token: process.env.DISCORD_TOKEN,
  
  // ntfy.sh topic
  ntfyTopic: process.env.NTFY_TOPIC,
  
  // Discord client intents
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
};

// Validate required environment variables
if (!Config.token) {
  console.error('Error: DISCORD_TOKEN is not set in the .env file');
  process.exit(1);
} 