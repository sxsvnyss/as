const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "timeout",
  aliases: ["to"],
  description: "Timeout a user for a specified duration",
  async execute(message, args, context) {
    // Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("You do not have permission to timeout members.");
      return await context.sendTemporaryEmbed(errorEmbed);
    }

    // Check if user and duration are provided
    const member = message.mentions.members.first();
    let match;
    const timeArg = args[1]?.toLowerCase(); // Single declaration of timeArg

    if (!member || !timeArg) {
      return await sendHelpMessage(message, context);
    }

    // Parse duration and unit
    match = timeArg.match(/^(\d+)([smhw])$/);
    if (!match) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ Invalid time format! Use: `<number><s/m/h/w>`\nExample: `30s`, `5m`, `2h`, `1w`");
      return await context.sendTemporaryEmbed(errorEmbed);
    }

    const [_, duration, unit] = match;
    let timeInMs;

    // Convert to milliseconds
    switch (unit) {
      case 's': timeInMs = duration * 1000; break;
      case 'm': timeInMs = duration * 60 * 1000; break;
      case 'h': timeInMs = duration * 3600 * 1000; break;
      case 'w': timeInMs = duration * 604800 * 1000; break;
      default:
        return await sendHelpMessage(message, context);
    }

    // Check if duration is within Discord's limits (max 28 days)
    if (timeInMs > 2419200000) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("❌ Timeout duration cannot exceed 28 days!");
      return await context.sendTemporaryEmbed(errorEmbed);
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';
    const timeDisplay = `${duration}${unit}`;

    console.log(`Attempting to timeout user for ${timeDisplay}`);

    try {
      await member.timeout(timeInMs, reason);
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("User Timed Out")
        .setDescription(
          `**${member.user.tag}** has been timed out for **${timeDisplay}**\nReason: ${reason} ⏳`
        )
        .setTimestamp();

      await context.sendTemporaryEmbed(embed);
    } catch (err) {
      console.error('Error timing out member:', err);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(
          "I was unable to timeout the member. Please check if the user is in the server and if the bot has the necessary permissions."
        );
      await context.sendTemporaryEmbed(errorEmbed);
    }
  },
};

async function sendHelpMessage(message, context) {
  const helpEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("⏰ Timeout Command Guide")
    .setDescription("Time someone out from the server.")
    .addFields(
      { name: "Usage", value: "`anwtimeout @user <time><unit> [reason]`" },
      { 
        name: "Time Units", 
        value: "`s` = seconds\n`m` = minutes\n`h` = hours\n`w` = weeks"
      },
      { 
        name: "Examples", 
        value: "`anwtimeout @user 30s`\n`anwtimeout @user 5m reason`\n`anwtimeout @user 2h breaking rules`\n`anwtimeout @user 1w spamming`"
      }
    )
    .setFooter({ text: "Note: Maximum timeout duration is 28 days" })
    .setTimestamp();

  await context.sendTemporaryEmbed(helpEmbed);
}