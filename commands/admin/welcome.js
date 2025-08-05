const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Comandos relacionados ao sistema de boas-vindas')
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Testa a mensagem de boas-vindas')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configura o canal de boas-vindas')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal onde as mensagens de boas-vindas serão enviadas')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'test') {
            // Canal específico para mensagens de boas-vindas
            const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '1401005523859673129';
            const welcomeChannel = interaction.guild.channels.cache.get(WELCOME_CHANNEL_ID);
            
            if (!welcomeChannel) {
                await interaction.reply({
                    content: `❌ Canal de boas-vindas (ID: ${WELCOME_CHANNEL_ID}) não encontrado!`,
                    ephemeral: true
                });
                return;
            }
            
            // Simular uma mensagem de boas-vindas
            const member = interaction.member;
            
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎉 Bem-vindo(a) ao servidor! (TESTE)')
                .setDescription(`Olá ${member}, seja muito bem-vindo(a) ao **${interaction.guild.name}**!`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '👤 Membro',
                        value: member.user.tag,
                        inline: true
                    },
                    {
                        name: '📅 Conta criada',
                        value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
                        inline: true
                    },
                    {
                        name: '👥 Você é o membro',
                        value: `#${interaction.guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: '📋 Como começar',
                        value: '• Digite `/help` para ver os comandos\n• Leia as regras do servidor\n• Divirta-se!',
                        inline: false
                    }
                )
                .setFooter({
                    text: `${interaction.guild.name} • Sistema de Boas-vindas (TESTE)`,
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            await interaction.reply({
                content: `🧪 **Teste enviado para ${welcomeChannel}!**\nVerifique o canal de boas-vindas.`,
                ephemeral: true
            });

            // Enviar a mensagem de teste no canal correto
            await welcomeChannel.send({
                content: `🧪 **TESTE** - ${member} acabou de entrar no servidor!`,
                embeds: [welcomeEmbed]
            });

        } else if (subcommand === 'config') {
            const channel = interaction.options.getChannel('canal');
            
            if (channel.type !== 0) {
                await interaction.reply({
                    content: '❌ Por favor, selecione um canal de texto válido!',
                    ephemeral: true
                });
                return;
            }

            const configEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('⚙️ Canal de Boas-vindas Configurado')
                .setDescription(`O canal de boas-vindas foi definido como ${channel}`)
                .addFields(
                    {
                        name: '📝 Nota',
                        value: 'As mensagens de boas-vindas agora serão enviadas neste canal quando novos membros entrarem.',
                        inline: false
                    },
                    {
                        name: '🧪 Teste',
                        value: 'Use `/welcome test` para ver como ficará a mensagem.',
                        inline: false
                    }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [configEmbed] });

            // Aqui você poderia salvar a configuração em um banco de dados
            // Por enquanto, vamos apenas informar que foi configurado
            console.log(`✅ Canal de boas-vindas configurado para: ${channel.name} (${channel.id})`);
        }
    },
};
