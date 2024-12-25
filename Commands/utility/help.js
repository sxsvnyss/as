const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "help",
  description: "Show all available commands",
  async execute(message, args, context) {
    const commands = [
      {
        name: "ban",
        description: "🚫 ini buat ngeban",
        usage: "anwban @user [reason]",
        category: "Moderation",
      },
      {
        name: "kick",
        description: "👢 ini buat ngekick anak ktol dari server",
        usage: "anwkick @user [reason]",
        category: "Moderation",
      },
      {
        name: "timeout",
        description: "⏳ ini buat to orang orang ngespam command",
        usage: "anwtimeout @user <time><s/m/h/w> [reason]",
        category: "Moderation",
      },
      {
        name: "removetimeout",
        description: "🔄 ini buat removeTimeout",
        usage: "anwrto @user",
        category: "Moderation",
      },
      { 
        name: "remind", 
        description: "⏰ ini buat reminder",
        usage: "anwremind [time] [message]",
        category: "Utility" 
      },
      {
        name: "afk",
        description: "🛌 ini buat lu AFK",
        usage: "anwafk [reason]",
        category: "Utility",
      },
      {
        name: "avatar",
        description: "🖼️ ini buat nunjukin pp orang",
        usage: "anwavatar [@user]",
        category: "Fun",
      },
     {
        name: "Note",
        description: "Bang udah bang jangan nyepam command,authornya cape ngntot",
        usage: "—",
        category: "Note",
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
      const NoteCommands = commands.filter((cmd) => cmd.category === "Note");

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

const NoteEmbed = new EmbedBuilder()
        .setColor("#ffff00")
        .setTitle("Note buat lu pada ni ajg")
        .setDescription(
          NoteCommands
            .map((cmd) => `**${cmd.name}**: ${cmd.description}`)
            .join("\n\n")
        )
        .setTimestamp();

      await i.reply({ embeds: [moderationEmbed], ephemeral: true });
      await i.followUp({ embeds: [utilityEmbed], ephemeral: true });
      await i.followUp({ embeds: [funEmbed], ephemeral: true });
      await i.followUp({ embeds: [NoteEmbed], ephemeral: true });
     });

    // Don't delete help message as it contains buttons
    return helpMessage;
  },
};
