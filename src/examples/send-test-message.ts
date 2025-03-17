import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

// ntfy.sh topic
const ntfyTopic = process.env.NTFY_TOPIC || 'discord-nat3z-spore-scoop-good';

/**
 * Send a test message to ntfy.sh
 */
async function sendTestMessage() {
  const message = 'This is a test message from the Discord Forwarder Bot';
  
  // Discord logo as an example icon
  const iconUrl = 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png';
  
  try {
    const response = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Title': 'Discord Bot Test',
        'Icon': iconUrl,
      },
      body: message,
    });
    
    if (response.ok) {
      console.log(`Message sent successfully to ntfy.sh/${ntfyTopic}`);
    } else {
      console.error(`Failed to send message: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Execute the function
sendTestMessage(); 