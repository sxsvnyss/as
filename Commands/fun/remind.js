const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'remind',
    description: 'Set a reminder',
    aliases: ['r'],
    async execute(message, args, context) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Reminder Command Usage')
                .setDescription('To set a reminder, use the following format:')
                .addFields(
                    { name: 'Usage', value: 'anwremind <time> <message>' },
                    { name: 'Example', value: 'anwremind 10m Take a break' }
                )
                .setFooter({ text: 'Make sure to specify the time and message.' });

            return await context.sendTemporaryEmbed(embed);
        }

        const time = args[0];
        const reminderMessage = args.slice(1).join(' ') || 'No message provided';

        let timeInMs;
        const timeUnit = time.slice(-1);
        const timeValue = parseInt(time.slice(0, -1), 10);

        if (isNaN(timeValue)) {
            return await context.sendTemporaryEmbed(new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Invalid Time Format')
                .setDescription('Please provide a valid time format (e.g., 10s, 1h, 1w).')
                .setFooter({ text: 'Make sure to specify the time correctly.' })
            );
        }

        switch (timeUnit) {
            case 's': timeInMs = timeValue * 1000; break;
            case 'm': timeInMs = timeValue * 60 * 1000; break;
            case 'h': timeInMs = timeValue * 60 * 60 * 1000; break;
            case 'w': timeInMs = timeValue * 7 * 24 * 60 * 60 * 1000; break;
            default:
                return await context.sendTemporaryEmbed(new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Invalid Time Unit')
                    .setDescription('Please provide a valid time unit (s, m, h, w).')
                    .setFooter({ text: 'Make sure to specify the time unit correctly.' })
                );
        }

        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('Reminder!')
                .setDescription(`Hey <@${message.author.id}>, it's time for your reminder: **${reminderMessage}**`)
                .setFooter({ text: 'Stay on track!' });

            await context.sendPermanentEmbed(reminderEmbed);
        }, timeInMs);

        const confirmationEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Reminder Set')
            .setDescription(`Hey <@${message.author.id}>, reminder set for **${time}**: **${reminderMessage}**`)
            .setFooter({ text: 'You will be notified when the time is up.' });

        await context.sendTemporaryEmbed(confirmationEmbed);
    }
};