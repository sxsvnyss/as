# Project Title

# Discord Bot

This is a Discord bot that performs various functions, including moderation, greeting users, and providing fun commands.

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory and add the required environment variables:
- `DISCORD_TOKEN`: Your bot's token.
- `WEBHOOK_URL`: The webhook URL for logging.
- `COMMAND_PREFIX`: The prefix for commands (default is 'anw').
- Other URLs and IDs as needed.

## Features

- **Greeting Users**: The bot can greet users when they join the server.
- **Moderation Commands**: Includes commands for banning, kicking, and timing out users.
- **Fun Commands**: Various fun commands like creating love images and avatars.
- **Utility Commands**: Provides helpful commands for users.

## Running the Bot

To start the bot, run the following command:
```bash
node bot.js
```
