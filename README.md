# Discord Forwarder Bot

A Discord bot that forwards messages from any channel to an ntfy.sh webhook.

## Project Structure

```none
discord-forwarder-bot/
├── src/
│   ├── config.ts         # Configuration and environment variables
│   ├── client.ts         # Discord client setup
│   └── services/
│       └── ntfy.ts       # ntfy.sh forwarding service
├── index.ts              # Main entry point
├── .env                  # Environment variables (not tracked by git)
├── package.json          # Project dependencies
└── README.md             # This file
```

## Setup

1. Clone this repository
2. Install dependencies:

   ```none
   bun install
   ```

3. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to the "Bot" tab and create a bot
   - Enable "Message Content Intent" under Privileged Gateway Intents
   - Copy the bot token
4. Update the `.env` file with your Discord bot token:

   ```none
   DISCORD_TOKEN=your_discord_bot_token_here
   NTFY_TOPIC=your_ntfy_topic_here
   ```none

5. Invite the bot to your server using the OAuth2 URL generator in the Discord Developer Portal

   - Select "bot" scope
   - Select permissions: "Read Messages/View Channels" and "Read Message History"

## Usage

Start the bot:

```bash
bun start
```

For development with auto-restart on file changes:

```bash
bun dev
```

Test the ntfy.sh connection without starting the bot:

```bash
bun test-ntfy
```

The bot will forward all messages from any channel it can access to the ntfy.sh webhook.

## Subscribing to Notifications

You can subscribe to the notifications using:

- The ntfy.sh web interface: <https://ntfy.sh/your_topic_here>
- The ntfy mobile app: Subscribe to the topic "your_topic_here"
- Command line: `curl -s https://ntfy.sh/your_topic_here/json`

## License

MIT
