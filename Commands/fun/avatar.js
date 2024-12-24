const { EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  name: 'avatar',
  aliases: ['pp'],
  description: 'Show user avatar (server and global)',
  async execute(message, args) {
    // Get target user or message author
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    // Get both avatar URLs
    const globalAvatarURL = user.displayAvatarURL({ size: 4096, dynamic: true });
    const serverAvatarURL = member.displayAvatarURL({ size: 4096, dynamic: true });

    // Send both avatars in one message
    if (globalAvatarURL === serverAvatarURL) {
      await message.reply(`**${user.tag}'s Avatar:**\n${globalAvatarURL}`);
    } else {
      await message.reply(
        `**${user.tag}'s Avatars:**\n` +
        `Global: ${globalAvatarURL}\n` +
        `Server: ${serverAvatarURL}`
      );
    }
  },
};
