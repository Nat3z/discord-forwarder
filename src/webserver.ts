import express from 'express';
import { Client } from 'discord.js-selfbot-v13';
import { Config } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Set up the web server for managing allowed servers
 * @param client Discord client
 */
export function setupWebServer(client: Client) {
  const app = express();
  const router = express.Router();
  
  // Configure middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  
  // API routes
  
  // Get user info
  router.get('/api/user', (req, res) => {
    if (!client.user) {
      res.status(401).json({ error: 'Client not authenticated' });
      return;
    }
    
    res.json({
      id: client.user.id,
      username: client.user.username,
      discriminator: client.user.discriminator,
      tag: client.user.tag,
      avatar: client.user.displayAvatarURL({ format: 'png', size: 128 })
    });
  });
  
  // Get all servers the user is in
  router.get('/api/servers', (req, res) => {
    if (!client.user) {
      res.status(401).json({ error: 'Client not authenticated' });
      return;
    }
    
    const servers = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ format: 'png', size: 128 }),
      memberCount: guild.memberCount,
      isAllowed: Config.allowedServers.includes(guild.id)
    }));
    
    res.json(servers);
  });
  
  // Get channels for a specific server
  router.get('/api/servers/:serverId/channels', (req, res) => {
    const { serverId } = req.params;
    
    if (!client.user) {
      res.status(401).json({ error: 'Client not authenticated' });
      return;
    }
    
    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }
    
    // Get text channels from the server
    const channels = guild.channels.cache
      .filter(channel => channel.type === 'GUILD_TEXT' || channel.type === 'GUILD_NEWS')
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        isAllowed: Config.allowedChannels[serverId]?.includes(channel.id) || false
      }));
    
    res.json(channels);
  });
  
  // Get list of allowed servers
  router.get('/api/allowed-servers', (req, res) => {
    res.json({
      allowedServers: Config.allowedServers,
      allowedChannels: Config.allowedChannels
    });
  });
  
  // Update server settings
  router.post('/api/server-settings', (req, res) => {
    const { servers, channels } = req.body;
    
    if (!Array.isArray(servers)) {
      res.status(400).json({ error: 'Invalid servers array' });
      return;
    }
    
    if (typeof channels !== 'object') {
      res.status(400).json({ error: 'Invalid channels object' });
      return;
    }
    
    // Verify all server IDs are valid
    const validServers = servers.filter(id => client.guilds.cache.has(id));
    
    // Verify all channel IDs belong to their servers
    const validChannels: Record<string, string[]> = {};
    
    for (const serverId in channels) {
      if (!client.guilds.cache.has(serverId)) {
        continue; // Skip invalid servers
      }
      
      const guild = client.guilds.cache.get(serverId);
      if (!guild) continue;
      
      const serverChannels = channels[serverId] || [];
      
      // Filter out invalid channel IDs
      validChannels[serverId] = serverChannels.filter((channelId: string) => 
        guild.channels.cache.has(channelId) && 
        (guild.channels.cache.get(channelId)?.type === 'GUILD_TEXT' || 
         guild.channels.cache.get(channelId)?.type === 'GUILD_NEWS')
      );
    }
    
    // Update config
    Config.updateServerSettings(validServers, validChannels);
    
    res.json({ 
      success: true, 
      allowedServers: Config.allowedServers, 
      allowedChannels: Config.allowedChannels 
    });
  });
  
  // Serve the main HTML page
  router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
  
  // Use the router
  app.use(router);
  
  // Start the server
  const server = app.listen(Config.webServer.port, Config.webServer.host, () => {
    console.log(`Web UI is now available at http://${Config.webServer.host}:${Config.webServer.port}`);
    console.log(`Settings can be configured in the browser interface`);
    
    // Log some helpful environment info
    if (process.env.PORT) {
      console.log(`Using custom port: ${process.env.PORT}`);
    }
    if (process.env.HOST) {
      console.log(`Using custom host: ${process.env.HOST}`);
    }
  });
  
  return server;
} 