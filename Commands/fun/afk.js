const { EmbedBuilder } = require('discord.js');

// Store AFK users and their reasons
const afkUsers = new Map();

module.exports = {
  name: 'afk',
  description: 'Set your AFK status',
  aliases: ['away'],

  async execute(message, args) {
    const reason = args.join(' ') || 'No reason provided';
    const user = message.author;

    // Set user as AFK
    afkUsers.set(user.id, {
      reason,
      timestamp: Date.now(),
      nickname: message.member.displayName
    });

    // Try to add [AFK] to nickname
    try {
      if (!message.member.displayName.startsWith('[AFK]')) {
        await message.member.setNickname(`[AFK] ${message.member.displayName}`);
      }
    } catch (error) {
      console.log('Could not update nickname:', error);
    }

    await message.reply(`I've set your AFK: ${reason}`);
  },

  // Listen for messages to remove AFK status and mention notifications
  async listenForMessages(message) {
    const user = message.author;

    // Remove AFK status if user sends a message
    if (afkUsers.has(user.id)) {
      afkUsers.delete(user.id);
      try {
        const currentName = message.member.displayName;
        if (currentName.startsWith('[AFK]')) {
          await message.member.setNickname(currentName.replace('[AFK] ', ''));
        }
      } catch (error) {
        console.log('Could not update nickname:', error);
      }
      await message.reply('Welcome back! I removed your AFK status.');
      return;
    }

    // Check for mentions of AFK users
    message.mentions.users.forEach(async (mentionedUser) => {
      const afkUser = afkUsers.get(mentionedUser.id);
      if (afkUser) {
        const duration = Math.floor((Date.now() - afkUser.timestamp) / 60000);
        await message.reply(
          `${mentionedUser.tag} is AFK: ${afkUser.reason} (${duration} minutes ago)`
        );
      }
    });
  }
};
