const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra informações sobre o servidor'),
    async execute(interaction) {
        const guild = interaction.guild;
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📊 Informações do Servidor`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { 
                    name: '🏷️ Nome', 
                    value: guild.name, 
                    inline: true 
                },
                { 
                    name: '🆔 ID', 
                    value: guild.id, 
                    inline: true 
                },
                { 
                    name: '👑 Dono', 
                    value: `<@${guild.ownerId}>`, 
                    inline: true 
                },
                { 
                    name: '👥 Membros', 
                    value: guild.memberCount.toString(), 
                    inline: true 
                },
                { 
                    name: '📅 Criado em', 
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, 
                    inline: true 
                },
                { 
                    name: '🎭 Boost Level', 
                    value: guild.premiumTier.toString(), 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Solicitado por ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
