const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
  } = require("discord.js");
  
  module.exports = {
    name: 'welcome',
    async execute(member) {
      try {
        const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!channel) {
          console.error(`Channel with ID ${process.env.WELCOME_CHANNEL_ID} not found`);
          return;
        }
  
        const welcomeMessage = `Welcome ${member}!`;
  
        const button1 = new ButtonBuilder()
          .setLabel("Tiktok❤︎")
          .setURL("https://www.tiktok.com/@titikumpul.ofc?_t=8sCxG2NEjjk&_r=1")
          .setStyle(ButtonStyle.Link);
  
        const button2 = new ButtonBuilder()
          .setLabel("Instagram❤︎")
          .setURL("https://www.instagram.com/titikumpul.ofc?igsh=ZmhrOGYwa2ljd3lx")
          .setStyle(ButtonStyle.Link);
  
        const button3 = new ButtonBuilder()
          .setLabel("Claim Roles! 💢")
          .setURL("https://discord.com/channels/1182132945339822183/1291560134555734088")
          .setStyle(ButtonStyle.Link);
  
        const row = new ActionRowBuilder().addComponents(button1, button2, button3);
  
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle("Selamat Datang!")
          .setDescription(`A-anu.. Selamat datang hehe, ${member}!`)
          .setThumbnail(member.user.avatarURL())
          .setImage("https://cdn.discordapp.com/attachments/1312294331763396618/1317445253678104608/1000098266.gif")
          .setTimestamp()
          .setFooter({ text: "Selamat bergabung di server kami!" });
  
        await channel.send({
          content: welcomeMessage,
          embeds: [welcomeEmbed],
          components: [row],
        });
      } catch (error) {
        console.error("Error welcoming new member:", error);
      }
    }
  };