const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com pong e mostra a latência do bot'),
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: '🏓 Calculando ping...', 
            fetchReply: true 
        });
        
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);
        
        await interaction.editReply(
            `🏓 **Pong!**\n` +
            `⏱️ **Latência:** ${timeDiff}ms\n` +
            `💻 **API:** ${apiPing}ms`
        );
    },
};
