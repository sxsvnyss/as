const { Message } = require('discord.js');

module.exports = {
    name: 'hello',
    description: 'Respond with a greeting',
    execute(message) {
        const greetings = {
            'siang': 'Selamat siang bub',
            'malam': 'Selamat malam bub',
            'sore': 'Selamat sore bub',
            'pagi': 'Selamat pagi bub',
        };

        const userId = message.author.id; // Get the ID of the user who sent the message
        const userMessage = message.content.toLowerCase();

        // Check for specific user responses
        if (userId === process.env.SPECIAL_USER_ID) {
            message.channel.send('diem lu war');
        } else if (greetings[userMessage]) {
            // Append "bub" for a specific user
            const response = userId === process.env.BUB_USER_ID ? `${greetings[userMessage]} ` : greetings[userMessage];
            message.channel.send(response);
        } else {
            message.channel.send('iya'); // Default response for unrecognized messages
        }
    }
};
