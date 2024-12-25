const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'remind',
    description: 'Set a reminder',
    aliases: ['r', 'reminder'],
    async execute(message, args, { sendTemporaryEmbed }) {
        // Check if sufficient arguments are provided
        if (args.length < 2) {
            return await sendHelpMessage(message, sendTemporaryEmbed);
        }

        const timeArg = args[0].toLowerCase();
        const reminderText = args.slice(1).join(' ');

        // Check if reminder text is provided
        if (!reminderText) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ kasih waktu ajg dikira gua dukun apa')
                .setTimestamp();
            return await sendTemporaryEmbed(message, errorEmbed);
        }

        // Parse time with regex
        const timeMatch = timeArg.match(/^(\d+)([smhd])$/);
        if (!timeMatch) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Invalid time format!\nUse: `<number><s/m/h/d>`\nExample: `30s`, `5m`, `2h`, `1d`')
                .setTimestamp();
            return await sendTemporaryEmbed(message, errorEmbed);
        }

        const timeValue = parseInt(timeMatch[1]);
        const timeUnit = timeMatch[2];

        // Convert time to milliseconds
        let timeInMs;
        switch (timeUnit) {
            case 's': // Seconds
                timeInMs = timeValue * 1000;
                break;
            case 'm': // Minutes
                timeInMs = timeValue * 60 * 1000;
                break;
            case 'h': // Hours
                timeInMs = timeValue * 60 * 60 * 1000;
                break;
            case 'd': // Days
                timeInMs = timeValue * 24 * 60 * 60 * 1000;
                break;
            default:
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Invalid time unit! Use `s` (seconds), `m` (minutes), `h` (hours), or `d` (days)')
                    .setTimestamp();
                return await sendTemporaryEmbed(message, errorEmbed);
        }

        // Set limits
        const MIN_TIME = 5 * 1000; // 5 seconds
        const MAX_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (timeInMs < MIN_TIME) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ Reminder time harus lebih dari 5 detik ngntd!')
                .setTimestamp();
            return await sendTemporaryEmbed(message, errorEmbed);
        }

        if (timeInMs > MAX_TIME) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ goblok remind gabisa lebih dari 7 hari dikira gua pembantu lu ajg!')
                .setTimestamp();
            return await sendTemporaryEmbed(message, errorEmbed);
        }

        // Calculate end time
        const endTime = new Date(Date.now() + timeInMs);
        const formattedTime = formatTime(timeInMs);

        // Set the reminder
        try {
            // Send confirmation message
            const confirmationEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('⏰ Reminder Set')
                .setDescription(`gua ingetin lu pas **${formattedTime}**`)
                .addFields(
                    { name: 'Message', value: reminderText },
                    { name: 'Will remind at', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>` }
                )
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();
            await sendTemporaryEmbed(message, confirmationEmbed);

            // Set the timeout
            setTimeout(async () => {
                const reminderEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⏰ Reminder!')
                    .setDescription(`woi memek ${message.author}, lu masang reminder ajg!`)
                    .addFields(
                        { name: 'Message', value: reminderText },
                        { name: 'Set', value: `<t:${Math.floor(Date.now() / 1000)}:R>` }
                    )
                    .setFooter({ text: `From: ${message.author.tag}` })
                    .setTimestamp();

                try {
                    await message.channel.send({ content: `<@${message.author.id}>`, embeds: [reminderEmbed] });
                } catch (error) {
                    console.error('Error sending reminder:', error);
                }
            }, timeInMs);

        } catch (error) {
            console.error('Error setting reminder:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while setting the reminder!')
                .setTimestamp();
            await sendTemporaryEmbed(message, errorEmbed);
        }
    }
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

async function sendHelpMessage(message, sendTemporaryEmbed) {
    const helpEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⏰ Reminder Command Help')
        .setDescription('Nih jink kaya gini')
        .addFields(
            { name: 'Usage', value: '`anwremind <waktu><berapalama> <alesanluremind>`' },
            { 
                name: 'Time Units', 
                value: '`s` = seconds\n`m` = minutes\n`h` = hours\n`d` = days'
            },
            { 
                name: 'Examples', 
                value: '`anwremind 30s Check oven`\n`anwremind 5m Take a break`\n`anwremind 2h Meeting`\n`anwremind 1d Daily task`'
            },
            {
                name: 'Limits',
                value: '• Minimum: 5 seconds\n• Maximum: 7 days'
            }
        )
        .setFooter({ text: 'You will be pinged when the reminder is due!' })
        .setTimestamp();

    await sendTemporaryEmbed(message, helpEmbed);
}