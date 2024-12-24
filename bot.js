const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  VoiceChannel
} = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
require("dotenv").config();
const axios = require("axios");

// Add at the top with other requires
const cooldowns = new Set();

// Add after the requires
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

// Add the new greeting handler require
const greetingHandler = require('./commands/fun/greeting');

// Replace single channel tracking with array from env
const TRACKING_CHANNEL_IDS = process.env.TRACK_CHANNEL_IDS?.split(',') || [];

// Add this after other constants
const GREETINGS = ['pagi', 'siang', 'sore', 'malam'];
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID; // Add this to your .env file

// Create client with all necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Set prefix from environment variable or default
const customPrefix = process.env.COMMAND_PREFIX || "anw";

// Create a collection for commands
client.commands = new Collection();

// Import all commands
const commands = {
  moderation: {
    ban: require("./commands/moderation/ban"),
    kick: require("./commands/moderation/kick"),
    timeout: require("./commands/moderation/timeout"),
    removeTimeout: require("./commands/moderation/removeTimeout"),
  },
  fun: {
    afk: require("./commands/fun/afk"),
    avatar: require("./commands/fun/avatar"),
    remind: require("./commands/fun/remind"), // Add gang command
  },
  utility: {
    help: require("./commands/utility/help"),
  },
};

// Function to send temporary embed messages
async function sendTemporaryEmbed(message, embed, duration = 10000) { // Changed from 5000 to 10000
  try {
    const sentMessage = await message.reply({ embeds: [embed] });
    setTimeout(() => {
      sentMessage
        .delete()
        .catch((err) => console.error("Error deleting message:", err));
    }, duration);
  } catch (error) {
    console.error("Error sending temporary embed:", error);
  }
}

// Register commands with modified execute functions
function registerCommands() {
  const registerCommand = (command) => {
    // Store the original execute function
    const originalExecute = command.execute;

    // Create new execute function with reply and auto-delete
    command.execute = async (message, args) => {
      try {
        // Create a context object with helper functions
        const context = {
          sendTemporaryEmbed: (embed) => sendTemporaryEmbed(message, embed),
          reply: message.reply.bind(message),
        };

        // Call the original execute with additional context
        await originalExecute.call(command, message, args, context);
      } catch (error) {
        console.error(`Error executing command ${command.name}:`, error);
        const errorEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Command Error")
          .setDescription("An error occurred while executing the command.")
          .setTimestamp();

        await sendTemporaryEmbed(message, errorEmbed);
      }
    };

    // Register command and its aliases
    client.commands.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        client.commands.set(alias, command);
      });
    }
  };

  // Register all commands
  Object.values(commands).forEach((category) => {
    Object.values(category).forEach((command) => {
      registerCommand(command);
    });
  });
}

// Webhook logging function with temporary messages
async function logToWebhook(message) {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      console.log("\x1b[33mWebhook URL not configured\x1b[0m");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle("Bot Status")
      .setDescription(`**${message}**`)
      .setTimestamp();

    await axios.post(webhookUrl, { embeds: [embed] });
    console.log("\x1b[32mWebhook message sent successfully\x1b[0m");
  } catch (error) {
    console.error("Error sending log to webhook:", error);
  }
}

// Ready event
client.once("ready", async () => {
  console.log("\x1b[32mBot is now online\x1b[0m");
  
  // Join voice channel and set up activities
  try {
    // Join voice channel
    const channel = client.channels.cache.get(VOICE_CHANNEL_ID);
    if (channel && channel.isVoiceBased()) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
      });

      // Keep connection alive
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      connection.subscribe(player);
      console.log('Successfully joined voice channel');
    }

    // Set up rotating activities
    const activities = [
      {
        name: 'TITIK KUMPUL',
        type: 2, // LISTENING
        url: 'https://discord.gg/titikkumpul'
      },
      {
        name: 'Want to join our server?',
        type: 0, // PLAYING
        url: 'https://discord.gg/titikkumpul'
      },
      {
        name: 'Titik Kumpul Community',
        type: 3  // WATCHING
      }
    ];

    let currentActivity = 0;
    
    // Set initial activity
    client.user.setPresence({
      activities: [activities[0]],
      status: 'online'
    });
    
    // Rotate activities
    setInterval(() => {
      currentActivity = (currentActivity + 1) % activities.length;
      client.user.setPresence({
        activities: [activities[currentActivity]],
        status: 'online'
      });
    }, 15000);

  } catch (error) {
    console.error('Error in ready event:', error);
  }

  registerCommands();
  logToWebhook("Bot is now online and ready!");
});

// Message event handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Only log messages from tracked channels
  if (TRACKING_CHANNEL_IDS.includes(message.channel.id)) {
    const content = message.content.toLowerCase().trim();
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `${colors.bright}[${timestamp}]${colors.reset} ` +
      `${colors.blue}[#${message.channel.name}]${colors.reset} ` +
      `${colors.yellow}[${message.author.tag}]${colors.reset} ` +
      `${colors.magenta}${content}${colors.reset}`
    );
  }

  // Handle AFK checks
  if (commands.fun.afk && commands.fun.afk.listenForMessages) {
    commands.fun.afk.listenForMessages(message);
  }

  // Handle greetings using the new handler
  const wasGreeting = await greetingHandler.handleGreeting(message);
  if (wasGreeting) return;

  if (!message.content.startsWith(customPrefix)) return;

  const args = message.content.slice(customPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args);
    console.log(`Command executed: ${commandName} by ${message.author.tag}`);
    await logToWebhook(
      `Command ${commandName} executed by ${message.author.tag}`
    );
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    const errorEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Command Error")
      .setDescription("An error occurred while executing the command.")
      .setTimestamp();

    await sendTemporaryEmbed(message, errorEmbed);
  }
});

// Interaction handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Handle creator info button
  if (interaction.customId === 'Made by Sxsvnys') {
    await interaction.reply({ 
      content: '🎨 Want to know more about the Creator? Check your DMs!', 
      ephemeral: true 
    });
    
    try {
      const creatorInfo = 
        '🌟 **About the Creator**\n\n' +
        '• Developer: Sxsvnys\n' +
        '• Interests: Bot Development, Web Development\n' +
        '• Favorite Artist: Joji\n' +
        '• Currently: Living in Delusion\n\n' +
        'Thank you for using Titik Kumpul Bot! 💫';
      
      await interaction.user.send(creatorInfo);
    } catch (error) {
      console.error('Could not send DM:', error);
      await interaction.followUp({ 
        content: '❌ Unable to send DM. Please check if your DMs are open.',
        ephemeral: true 
      });
    }
  }
});

// Error handling
client.on("error", (error) => {
  console.error("Discord client error:", error);
  logToWebhook(`Error occurred: ${error.message}`);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  logToWebhook(`Unhandled Rejection: ${error.message}`);
});

// Login bot with token
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Failed to login:", error);
});
