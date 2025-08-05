const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra informações sobre um usuário')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('O usuário para ver as informações')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle(`👤 Informações do Usuário`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { 
                    name: '🏷️ Nome de usuário', 
                    value: user.tag, 
                    inline: true 
                },
                { 
                    name: '🆔 ID', 
                    value: user.id, 
                    inline: true 
                },
                { 
                    name: '🤖 Bot?', 
                    value: user.bot ? 'Sim' : 'Não', 
                    inline: true 
                },
                { 
                    name: '📅 Conta criada', 
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, 
                    inline: true 
                },
                { 
                    name: '📅 Entrou no servidor', 
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, 
                    inline: true 
                },
                { 
                    name: '🎭 Cargos', 
                    value: member.roles.cache
                        .filter(role => role.name !== '@everyone')
                        .map(role => role.toString())
                        .join(', ') || 'Nenhum cargo', 
                    inline: false 
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
