const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot logado como ${client.user.tag}!`);
        console.log(`🤖 Conectado em ${client.guilds.cache.size} servidor(es)`);
        
        // Definir status do bot
        client.user.setActivity('Digite /help para ajuda', { type: 'PLAYING' });
    },
};
