const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Collection,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require("discord.js");
  const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
  require("dotenv").config();
  const axios = require("axios");
  
  // Constants and Collections
  const cooldowns = new Set();
  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m"
  };
  
  // Handlers
  const greetingHandler = require('./Commands/fun/greeting');
  
  // Environment Variables
  const TRACKING_CHANNEL_IDS = process.env.TRACK_CHANNEL_IDS?.split(',') || [];
  const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;
  const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
  const customPrefix = process.env.COMMAND_PREFIX || "anw";
  
  // Create client with all necessary intents
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates
    ],
  });
  
  // Create a collection for commands
  client.commands = new Collection();
  
  // Import all commands
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
    greeting: {
      welcome: require("./Commands/greeting/welcome"),
    },
  };
  
  // Function to send temporary embed messages
  async function sendTemporaryEmbed(message, embed, duration = 10000) {
    try {
      const sentMessage = await message.reply({ embeds: [embed] });
      setTimeout(() => {
        sentMessage.delete().catch((err) => console.error("Error deleting message:", err));
      }, duration);
    } catch (error) {
      console.error("Error sending temporary embed:", error);
    }
  }
  
  // Register commands with modified execute functions
  function registerCommands() {
    const registerCommand = (command) => {
      const originalExecute = command.execute;
      command.execute = async (message, args) => {
        try {
          const context = {
            sendTemporaryEmbed: (embed) => sendTemporaryEmbed(message, embed),
            reply: message.reply.bind(message),
          };
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
      client.commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach((alias) => {
          client.commands.set(alias, command);
        });
      }
    };
  
    Object.values(commands).forEach((category) => {
      Object.values(category).forEach((command) => {
        registerCommand(command);
      });
    });
  }
  
  // Webhook logging function
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
  
  // Event Handlers
  client.once("ready", async () => {
    console.log("\x1b[32mBot is now online\x1b[0m");
    
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
          type: 2,
          url: 'https://discord.gg/titikkumpul'
        },
        {
          name: 'Want to join our server?',
          type: 0,
          url: 'https://discord.gg/titikkumpul'
        },
        {
          name: 'Titik Kumpul Community',
          type: 3
        }
      ];
  
      let currentActivity = 0;
      client.user.setPresence({
        activities: [activities[0]],
        status: 'online'
      });
      
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
  
    // Track messages in specified channels
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
      await command.execute(message, args);
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
  
  // Welcome event handler
  client.on('guildMemberAdd', async (member) => {
    try {
      await commands.greeting.welcome.execute(member);
      await logToWebhook(`New member welcomed: ${member.user.tag}`);
    } catch (error) {
      console.error('Error in welcome event:', error);
      await logToWebhook(`Error welcoming new member: ${error.message}`);
    }
  });
  
  // Button interaction handler
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
  
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
  
  // Bot login
  client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error("Failed to login:", error);
  });