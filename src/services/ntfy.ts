import { Message, TextChannel, MessageAttachment, Client } from 'discord.js-selfbot-v13';
import fetch from 'node-fetch';
import { Config } from '../config.js';

/**
 * Service to handle forwarding messages to ntfy.sh
 */
export class NtfyService {
  /**
   * Forward a Discord message to ntfy.sh
   * @param message The Discord message to forward
   */
  static async forwardMessage(message: Message, me: Client): Promise<void> {
    // Skip messages from bots or self
    if (message.author.bot || message.author.id === me.user?.id) {
      console.log('skipping message from bot or self')
      return
    }
    
    // Skip messages from servers that are not allowed
    if (message.guild) {
      // Check if the server and channel are allowed
      const serverId = message.guild.id;
      const channelId = message.channel.id;
      console.log('isAllowed', Config.isChannelAllowed(serverId, channelId)) 
      if (!Config.isChannelAllowed(serverId, channelId)) {
        return;
      }
    }
    
    try {
      const content = `${message.content}`;
      
      // Add attachments if any
      const attachments = Array.from(message.attachments.values())
        .map((attachment: MessageAttachment) => {
          const fileName = attachment.name || 'attachment';
          const fileExt = attachment.url.split('.').pop() || '';
          return `${fileName}.${fileExt}`;
        })
        .join('\n');
      
      const fullContent = attachments 
        ? `${content}\n\nAttachments:\n${attachments}` 
        : content;
      
      // Get the user's avatar URL
      const avatarUrl = message.author.displayAvatarURL({ format: 'png', size: 512 });
      
      // Get channel name safely
      let channelName = 'DM';
      if (message.channel.type === 'DM') {
        channelName = message.author.username;
      } else if (message.channel.type === 'GUILD_TEXT') {
        const textChannel = message.channel as TextChannel;
        channelName = `#${textChannel.name}`;
      }

      // Generate the appropriate Discord URL for the message
      let url = '';
      if (message.guild) {
        url = `https://canary.discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
      } else {
        url = `https://canary.discord.com/channels/@me/${message.channel.id}/${message.id}`;
      }
      
      let clickUrl = url;
      // Send to ntfy.sh
      const headers = {
          'Title': message.author.username + ` (${channelName}, ${message.guild?.name ?? 'DM'})`,
          'Icon': avatarUrl, // Add the avatar as the notification icon
          'Markdown': 'yes',
          'Click': clickUrl,
      }
      const response = await fetch(`https://ntfy.sh/${Config.ntfyTopic}`, {
        method: 'POST',
        headers,  
        body: fullContent,
      });
      console.log(headers)
      
      if (!response.ok) {
        console.error(`Failed to forward message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
    }
  }

} 