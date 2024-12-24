const cooldowns = new Set();

// Greeting responses with more natural language
const greetings = {
  'pagi': '🌅 Selamat pagi juga kak! Semangat menjalani hari ya!',
  'siang': '☀️ Selamat siang juga! Jangan lupa istirahat makan siang ya!',
  'sore': '🌅 Selamat sore juga! Tetap semangat untuk aktivitas selanjutnya!',
  'malam': '🌙 Selamat malam juga! Selamat beristirahat, mimpi indah!'
};

async function handleGreeting(message) {
  const content = message.content.toLowerCase().trim();
  
  try {
    // Check if message contains any greeting
    const foundGreeting = Object.keys(greetings).find(greeting => 
      content.includes(greeting) && 
      (content.length <= greeting.length + 5 || content.includes('selamat'))
    );

    if (!foundGreeting) return false;

    // Check cooldown
    if (cooldowns.has(message.author.id)) {
      console.log(`[Greeting] Cooldown active for ${message.author.tag}`);
      return false;
    }

    const response = greetings[foundGreeting];
    await message.reply(response);
    console.log(`[Greeting] Responded to "${message.content}" from ${message.author.tag}`);
    
    // Add cooldown
    cooldowns.add(message.author.id);
    setTimeout(() => cooldowns.delete(message.author.id), 30000);
    
    return true;
  } catch (error) {
    console.error('[Greeting Error]:', error);
    return false;
  }
}

module.exports = {
  handleGreeting,
  name: 'greeting',
  description: 'Handles automatic greeting responses'
};
