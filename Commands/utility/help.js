const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "help",
  description: "Show all available commands",
  async execute(message, args, context) {
    const commands = [
      {
        name: "ban",
        description: "🚫 Ban a user from the server",
        usage: "anwban @user [reason]",
        category: "Moderation",
      },
      {
        name: "kick",
        description: "👢 Kick a user from the server",
        usage: "anwkick @user [reason]",
        category: "Moderation",
      },
      {
        name: "timeout",
        description: "⏳ Timeout a user",
        usage: "anwtimeout @user <time><s/m/h/w> [reason]",
        category: "Moderation",
      },
      {
        name: "removetimeout",
        description: "🔄 Remove timeout from a user",
        usage: "anwrto @user",
        category: "Moderation",
      },
      { 
        name: "remind", 
        description: "⏰ Set a reminder",
        usage: "anwremind [time] [message]",
        category: "Utility" 
      },
      {
        name: "afk",
        description: "🛌 Set your status to AFK",
        usage: "anwafk [reason]",
        category: "Utility",
      },
      {
        name: "avatar",
        description: "🖼️ Show user's avatar",
        usage: "anwavatar [@user]",
        category: "Fun",
      },
    ];

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Titik Kumpul - Command Guide")
      .setDescription(
        "Untuk melihat semua perintah yang tersedia, klik tombol di bawah ini."
      )
      .setFooter({ text: "Prefix: anw | Example: anwhelp" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("show_categories")
        .setLabel("Titik Kumpul❤︎")
        .setStyle(ButtonStyle.Secondary)
    );

    const helpMessage = await message.reply({
      embeds: [embed],
      components: [row],
    });

    const filter = (i) => i.customId === "show_categories" && !i.user.bot;
    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      const moderationCommands = commands.filter(
        (cmd) => cmd.category === "Moderation"
      );
      const utilityCommands = commands.filter(
        (cmd) => cmd.category === "Utility"
      );
      const funCommands = commands.filter((cmd) => cmd.category === "Fun");

      const moderationEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Moderation Commands")
        .setDescription(
          moderationCommands
            .map((cmd) => `**${cmd.name}**: ${cmd.description}`)
            .join("\n\n")
        )
        .setTimestamp();

      const utilityEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Utility Commands")
        .setDescription(
          utilityCommands
            .map((cmd) => `**${cmd.name}**: ${cmd.description}`)
            .join("\n\n")
        )
        .setTimestamp();

      const funEmbed = new EmbedBuilder()
        .setColor("#ffff00")
        .setTitle("Fun Commands")
        .setDescription(
          funCommands
            .map((cmd) => `**${cmd.name}**: ${cmd.description}`)
            .join("\n\n")
        )
        .setTimestamp();

      await i.reply({ embeds: [moderationEmbed], ephemeral: true });
      await i.followUp({ embeds: [utilityEmbed], ephemeral: true });
      await i.followUp({ embeds: [funEmbed], ephemeral: true });
    });

    // Don't delete help message as it contains buttons
    return helpMessage;
  },
};
