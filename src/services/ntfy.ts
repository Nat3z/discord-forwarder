import { Message, TextChannel } from 'discord.js';
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
  static async forwardMessage(message: Message): Promise<void> {
    // Skip messages from bots to avoid potential loops
    if (message.author.bot) return;
    
    try {
      const content = `${message.content}`;
      
      // Add attachments if any
      const attachments = Array.from(message.attachments.values())
        .map(attachment => attachment.title + '.' + attachment.url.split('.').pop())
        .join('\n');
      
      const fullContent = attachments 
        ? `${content}\n\nAttachments:\n${attachments}` 
        : content;
      
      // Get the user's avatar URL
      const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 512 });
      
      // Get channel name safely
      const channel = message.channel.isTextBased() && message.channel instanceof TextChannel ? message.channel as TextChannel : null;
      let channelName = `${channel ? '#' + channel.name : 'DM'}`;

      let clickUrl = message.guild ? `https://canary.discord.com/app/` : 'https://canary.discord.com/channels/@me';
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