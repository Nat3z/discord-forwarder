# Discord Forwarder Bot

A Discord bot that forwards messages from any channel to an ntfy.sh webhook.

## Project Structure

```none
discord-forwarder-bot/
├── src/
│   ├── config.ts         # Configuration and environment variables
│   ├── client.ts         # Discord client setup
│   ├── webserver.ts      # Web UI for configuration
│   └── services/
│       └── ntfy.ts       # ntfy.sh forwarding service
├── public/               # Web UI assets
├── index.ts              # Main entry point
├── example.env           # Example environment variables
├── package.json          # Project dependencies
└── README.md             # This file
```

## Setup

1. Clone this repository
2. Install dependencies:

   ```none
   bun install
   ```

3. Get your Discord user account token by copy and pasting this code into inspect element on the discord website:

   ```javascript
   window.webpackChunkdiscord_app.push([
   [Math.random()],
   {},
   req => {
      if (!req.c) return;
      for (const m of Object.keys(req.c)
         .map(x => req.c[x].exports)
         .filter(x => x)) {
         if (m.default && m.default.getToken !== undefined) {
         return copy(m.default.getToken());
         }
         if (m.getToken !== undefined) {
         return copy(m.getToken());
         }
      }
   },
   ]);
   window.webpackChunkdiscord_app.pop();
   console.log('%cWorked!', 'font-size: 50px');
   console.log(`%cYou now have your token in the clipboard!`, 'font-size: 16px');
   ```

4. Create a `.env` file based on the example:

   ```none
   # Required Discord configuration
   DISCORD_TOKEN=your_discord_token_here
   
   # ntfy.sh configuration
   NTFY_TOPIC=your_ntfy_topic_here
   
   # Web server configuration (optional)
   # PORT=8080
   # HOST=0.0.0.0
   ```

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

## Web UI Configuration

The bot includes a web interface for selecting which servers and channels to forward messages from. By default, the web interface is available at:

```
http://127.0.0.1:3000
```

### Customizing the Web Server

You can customize the web server's port and host through environment variables in your `.env` file:

```
PORT=8080        # Change the port (default: 3000)
HOST=0.0.0.0     # Change the host (default: 127.0.0.1)
```

Setting the host to `0.0.0.0` will make the web interface accessible from other devices on your network.

## Subscribing to Notifications

You can subscribe to the notifications using:

- The ntfy.sh web interface: <https://ntfy.sh/your_topic_here>
- The ntfy mobile app: Subscribe to the topic "your_topic_here"
- Command line: `curl -s https://ntfy.sh/your_topic_here/json`

## License

MIT
