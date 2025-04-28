import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config();

// Default web server settings
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '127.0.0.1';

// Parse port from environment variable with validation
function parsePort(portStr: string | undefined): number {
  if (!portStr) return DEFAULT_PORT;
  
  const port = parseInt(portStr, 10);
  
  // Check if port is a valid number and in valid range (0-65535)
  if (isNaN(port) || port < 0 || port > 65535) {
    console.warn(`Invalid PORT env variable "${portStr}", using default port ${DEFAULT_PORT}`);
    return DEFAULT_PORT;
  }
  
  return port;
}

// File path for storing configuration
const ALLOWED_SERVERS_FILE = './cfg/allowed-servers.json';

// Read settings from file or initialize with defaults
let serverSettings: {
  allowedServers: string[];
  allowedChannels: Record<string, string[]>;
} = {
  allowedServers: [],
  allowedChannels: {}
};

try {
  if (fs.existsSync(ALLOWED_SERVERS_FILE)) {
    const data = fs.readFileSync(ALLOWED_SERVERS_FILE, 'utf8');
    serverSettings = JSON.parse(data);
    // Initialize allowedChannels if it doesn't exist in the file
    if (!serverSettings.allowedChannels) {
      serverSettings.allowedChannels = {};
    }
  } else {
    // if the directory doesn't exist, create it
    fs.mkdirSync('./cfg', { recursive: true });
    fs.writeFileSync(ALLOWED_SERVERS_FILE, JSON.stringify(serverSettings, null, 2));
  }
} catch (error) {
  console.error('Error loading server settings:', error);
}

// Configuration object
export const Config = {
  // Discord bot token
  token: process.env.DISCORD_TOKEN,
  
  // ntfy.sh topic
  ntfyTopic: process.env.NTFY_TOPIC,

  // Web server configuration
  webServer: {
    port: parsePort(process.env.PORT),
    host: process.env.HOST || DEFAULT_HOST
  },

  // Allowed servers (server IDs that are allowed for forwarding)
  allowedServers: serverSettings.allowedServers,

  // Allowed channels per server (map of server ID to array of channel IDs)
  allowedChannels: serverSettings.allowedChannels,

  // Check if a channel is allowed for message forwarding
  isChannelAllowed(serverId: string, channelId: string): boolean {
    // If server is not allowed, channel is not allowed
    if (!this.allowedServers.includes(serverId)) {
      return false;
    }
    
    // If no channels are specified for this server, all channels are allowed by default
    if (!this.allowedChannels[serverId] || this.allowedChannels[serverId].length === 0) {
      return true;
    }
    
    // Check if this specific channel is allowed
    return this.allowedChannels[serverId].includes(channelId);
  },

  // Update server settings and save to file
  updateServerSettings(servers: string[], channels: Record<string, string[]>) {
    this.allowedServers = servers;
    this.allowedChannels = channels;
    
    const settings = {
      allowedServers: this.allowedServers,
      allowedChannels: this.allowedChannels
    };
    
    fs.writeFileSync(ALLOWED_SERVERS_FILE, JSON.stringify(settings, null, 2));
  }
};

// Validate required environment variables
if (!Config.token) {
  console.error('Error: DISCORD_TOKEN is not set in the .env file');
  process.exit(1);
} 

// Log configuration
console.log(`Server will run on ${Config.webServer.host}:${Config.webServer.port}`);
if (process.env.PORT) {
  console.log(`Using PORT from environment: ${process.env.PORT}`);
} 