const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: 'welcome',
  description: 'Handles welcome messages for new members',
  async execute(member) {
    try {
      // Get the welcome channel
      const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
      if (!channel) {
        console.error(`Welcome channel ${process.env.WELCOME_CHANNEL_ID} not found`);
        return;
      }

      // Create welcome buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("Tiktok❤︎")
            .setURL("https://www.tiktok.com/@titikumpul.ofc?_t=8sCxG2NEjjk&_r=1")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("Instagram❤︎")
            .setURL("https://www.instagram.com/titikumpul.ofc?igsh=ZmhrOGYwa2ljd3lx")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("Claim Roles! 💢")
            .setURL("https://discord.com/channels/1182132945339822183/1291560134555734088")
            .setStyle(ButtonStyle.Link)
        );

      // Create welcome embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Selamat Datang!")
        .setDescription(`A-anu.. Selamat datang hehe, ${member}!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage("https://cdn.discordapp.com/attachments/1312294331763396618/1317445253678104608/1000098266.gif")
        .setTimestamp()
        .setFooter({ text: "Selamat bergabung di server kami!" });

      // Send welcome message
      await channel.send({
        content: `Welcome ${member}!`,
        embeds: [welcomeEmbed],
        components: [buttons]
      });

    } catch (error) {
      console.error("Error in welcome module:", error);
    }
  }
};