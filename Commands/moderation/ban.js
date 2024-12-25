const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ban",
  aliases: ["b"],
  description: "Ban a user from the server",
  async execute(message, args, { sendTemporaryEmbed }) { // Destructure sendTemporaryEmbed from the context
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ You do not have permission to ban members!");
      return await sendTemporaryEmbed(message, errorEmbed); // Use sendTemporaryEmbed directly
    }

    const member = message.mentions.members.first();
    if (!member) {
      const helpEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Ban Command Help")
        .setDescription("To ban a user, use the following command:")
        .addFields(
          { name: "Usage", value: "`anwban @user [reason]`" },
          { name: "Example", value: "`anwban @user spamming`" }
        )
        .setTimestamp();
      return await sendTemporaryEmbed(message, helpEmbed); // Use sendTemporaryEmbed directly
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!member.bannable) {
      return message.reply('❌ I cannot ban this member!');
    }

    try {
      await member.ban({ reason });
      return message.reply(`✅ Successfully banned ${member.user.tag} for: ${reason}`);
    } catch (error) {
      console.error('Error banning member:', error);
      return message.reply('❌ There was an error trying to ban this member!');
    }
  },
};