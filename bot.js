const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  ActivityType
} = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
require("dotenv").config();
const axios = require("axios");

// Constants and configurations
const cooldowns = new Set();
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

// Import handlers
const greetingHandler = require('./Commands/fun/greeting');
const welcomeHandler = require('./Commands/greeting/welcome');

// Environment variables
const TRACKING_CHANNEL_IDS = process.env.TRACK_CHANNEL_IDS?.split(',') || [];
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
const customPrefix = process.env.COMMAND_PREFIX || "anw";

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
});

// Initialize commands collection
client.commands = new Collection();

// Import commands
const commands = {
  moderation: {
    ban: require("./Commands/moderation/ban"),
    kick: require("./Commands/moderation/kick"),
    timeout: require("./Commands/moderation/timeout"),
    removeTimeout: require("./Commands/moderation/removeTimeout"),
  },
  fun: {
    afk: require("./Commands/fun/afk"),
    avatar: require("./Commands/fun/avatar"),
    remind: require("./Commands/fun/remind"),
  },
  utility: {
    help: require("./Commands/utility/help"),
  },
};

// Utility functions
async function sendTemporaryEmbed(message, embed, duration = 10000) {
  try {
    const sentMessage = await message.reply({ embeds: [embed] });
    setTimeout(() => {
      sentMessage.delete().catch(err => console.error("Error deleting message:", err));
    }, duration);
  } catch (error) {
    console.error("Error sending temporary embed:", error);
  }
}

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
  } catch (error) {
    console.error("Error sending log to webhook:", error);
  }
}

// Register commands
function registerCommands() {
  Object.values(commands).forEach(category => {
    Object.values(category).forEach(command => {
      client.commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach(alias => client.commands.set(alias, command));
      }
    });
  });
}

// Event Handlers
client.once("ready", async () => {
  console.log("\x1b[32mBot is now online\x1b[0m");
  registerCommands();

  // Join voice channel if configured
  if (VOICE_CHANNEL_ID) {
    const channel = client.channels.cache.get(VOICE_CHANNEL_ID);
    if (channel?.isVoiceBased()) {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true,
      });

      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
      });
      connection.subscribe(player);
    }
  }

  // Set up rotating activities
  const activities = [
    {
      name: 'TITIK KUMPUL',
      type: ActivityType.Listening,
      url: 'https://discord.gg/titikkumpul'
    },
    {
      name: 'Want to join our server?',
      type: ActivityType.Playing,
      url: 'https://discord.gg/titikkumpul'
    },
    {
      name: 'Titik Kumpul Community',
      type: ActivityType.Watching
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

  await logToWebhook("Bot is now online and ready!");
});

// Welcome new members
client.on("guildMemberAdd", async (member) => {
  try {
    await welcomeHandler.execute(member);
  } catch (error) {
    console.error("Error welcoming new member:", error);
    await logToWebhook(`Error welcoming new member: ${error.message}`);
  }
});

// Message handling
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Log tracked channels
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

  // Handle AFK status
  if (commands.fun.afk?.listenForMessages) {
    await commands.fun.afk.listenForMessages(message);
  }

  // Handle greetings
  const wasGreeting = await greetingHandler.handleGreeting(message);
  if (wasGreeting) return;

  // Handle commands
  if (!message.content.startsWith(customPrefix)) return;

  const args = message.content.slice(customPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args, { sendTemporaryEmbed });
    console.log(`Command executed: ${commandName} by ${message.author.tag}`);
    await logToWebhook(`Command ${commandName} executed by ${message.author.tag}`);
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

// Error handling
client.on("error", error => {
  console.error("Discord client error:", error);
  logToWebhook(`Error occurred: ${error.message}`);
});

process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
  logToWebhook(`Unhandled Rejection: ${error.message}`);
});

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error("Failed to login:", error);
});