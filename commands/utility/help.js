const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra a lista de comandos disponíveis'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🤖 Comandos do Bot - ASKAL')
            .setDescription('Aqui estão os comandos disponíveis para o servidor:')
            .addFields(
                {
                    name: '🏓 /ping',
                    value: 'Mostra a latência do bot',
                    inline: true
                },
                {
                    name: '📊 /serverinfo',
                    value: 'Informações sobre o servidor',
                    inline: true
                },
                {
                    name: '👤 /userinfo',
                    value: 'Informações sobre um usuário',
                    inline: true
                },
                {
                    name: '🎉 /welcome',
                    value: 'Sistema de boas-vindas (Admin)',
                    inline: true
                },
                {
                    name: '🎫 /ticket',
                    value: 'Sistema de tickets (Admin)\n• `/ticket setup` - Configura painel\n• `/ticket archive` - Arquiva ticket',
                    inline: true
                },
                {
                    name: '🛡️ /verificacao',
                    value: 'Sistema de verificação (Admin)\n• `/verificacao setup` - Configura sistema\n• `/verificacao regras` - Adiciona botão',
                    inline: true
                },
                {
                    name: '❓ /help',
                    value: 'Mostra esta mensagem',
                    inline: true
                }
            )
            .addFields(
                {
                    name: '🎮 DayZ RP - Deerisle',
                    value: 'Use o painel de tickets para suporte, denúncias e feedback!',
                    inline: false
                }
            )
            .setFooter({
                text: 'Askal Bot - ASKAL',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
