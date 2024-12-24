const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "untimeout",
  aliases: ["rto", "removetimeout"], // Added aliases here
  description: "Remove timeout from a user",
  async execute(message, args, context) {
    console.log("Remove timeout command invoked");

    // Check permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      console.log("User does not have permission to remove timeout");
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription("You do not have permission to remove timeouts.");
      return await context.sendTemporaryEmbed(errorEmbed);
    }

    const member = message.mentions.members.first();
    if (!member) {
      console.log("No user mentioned for removing timeout");
      return await sendHelpMessage(message, context);
    }

    console.log(
      `Attempting to remove timeout from user: ${member.user.tag}`
    );

    try {
      await member.timeout(null);
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Timeout Removed")
        .setDescription(
          `**${member.user.tag}** has had their timeout removed. ✅`
        )
        .setTimestamp();

      await context.sendTemporaryEmbed(embed);
    } catch (err) {
      console.error(err);
      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(
          "I was unable to remove the timeout from the member. Please check if the user is in the server and if the bot has the necessary permissions."
        );
      await context.sendTemporaryEmbed(errorEmbed);
    }
  },
};

async function sendHelpMessage(message, context) {
  const helpEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Remove Timeout Command Help")
    .setDescription(
      "To remove a timeout from a user, use the following command:"
    )
    .addFields(
      { name: "Usage", value: "**anwremoveTimeout @user**" },
      { name: "Example", value: "**anwremoveTimeout @JohnDoe**" },
      {
        name: "Note",
        value:
          '**You must have the "Moderate Members" permission to use this command.**',
      }
    )
    .setTimestamp();

  await context.sendTemporaryEmbed(helpEmbed);
}
