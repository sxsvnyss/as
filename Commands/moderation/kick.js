const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server',
  async execute(message, args) {
    // Check permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('❌ You do not have permission to kick members!');
    }

    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member) {
      return message.reply('❌ Please mention a member to kick!');
    }

    // Check if member is kickable
    if (!member.kickable) {
      return message.reply('❌ I cannot kick this member!');
    }

    try {
      await member.kick(reason);
      return message.reply(`✅ Successfully kicked ${member.user.tag} for: ${reason}`);
    } catch (error) {
      console.error('Error kicking member:', error);
      return message.reply('❌ There was an error trying to kick this member!');
    }
  },
};
