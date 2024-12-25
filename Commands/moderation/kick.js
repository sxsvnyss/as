const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server',
  async execute(message, args, { sendTemporaryEmbed }) {
    // Check permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ You do not have permission to kick members!");
      return await sendTemporaryEmbed(message, errorEmbed);
    }

    const member = message.mentions.members.first();
    if (!member) {
      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Kick Command Help")
        .setDescription("To kick a user, use the following command:")
        .addFields(
          { name: "Usage", value: "`anwkick @user [reason]`" },
          { name: "Example", value: "`anwkick @user breaking rules`" }
        )
        .setTimestamp();
      return await sendTemporaryEmbed(message, helpEmbed);
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    // Check if member is kickable
    if (!member.kickable) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ I cannot kick this member!");
      return await sendTemporaryEmbed(message, errorEmbed);
    }

    try {
      await member.kick(reason);
      const successEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("User Kicked")
        .setDescription(`✅ Successfully kicked ${member.user.tag}`)
        .addFields({ name: "Reason", value: reason })
        .setTimestamp();
      return await sendTemporaryEmbed(message, successEmbed);
    } catch (error) {
      console.error('Error kicking member:', error);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ There was an error trying to kick this member!");
      return await sendTemporaryEmbed(message, errorEmbed);
    }
  },
};