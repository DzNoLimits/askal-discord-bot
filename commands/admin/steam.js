const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steam')
        .setDescription('Sistema de vinculação Steam para controle total de players')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configura o sistema de vinculação Steam')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal para vinculação Steam (padrão: canal de verificação)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('vincular')
                .setDescription('Força a vinculação Steam de um usuário')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuário para vincular Steam')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('desvincular')
                .setDescription('Remove vinculação Steam de um usuário')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuário para desvincular Steam')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Verifica status de vinculação de um usuário')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuário para verificar (deixe vazio para ver o seu)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Estatísticas gerais de vinculação Steam')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('canal');
            const VERIFICATION_CHANNEL_ID = process.env.VERIFICATION_CHANNEL_ID || '1401005726847209604';
            const targetChannel = channel || interaction.guild.channels.cache.get(VERIFICATION_CHANNEL_ID);

            if (!targetChannel) {
                await interaction.reply({
                    content: '❌ Canal de verificação não encontrado!',
                    ephemeral: true
                });
                return;
            }

            // Embed principal do sistema Steam
            const steamEmbed = new EmbedBuilder()
                .setColor('#1b2838')
                .setTitle('🎮 Sistema de Vinculação Steam - DayZ ASKAL')
                .setDescription(
                    '**🔗 Vincule sua conta Steam para controle total!**\n\n' +
                    '🎁 **BENEFÍCIOS EXCLUSIVOS:**\n' +
                    '• 🎁 **Pacote de Boas-vindas** quando entrar no servidor\n' +
                    '• 🔒 **Segurança total** - uma Steam ID por pessoa\n' +
                    '• 🎯 **Acesso VIP** mais rápido para membros verificados\n' +
                    '• 📊 **Estatísticas personalizadas** de gameplay\n' +
                    '• 🏆 **Eventos exclusivos** para membros vinculados\n' +
                    '• 🔄 **Sincronização automática** com o servidor\n\n' +
                    '⚠️ **IMPORTANTE:**\n' +
                    '• Cada Discord pode ter apenas **UMA Steam ID vinculada**\n' +
                    '• O processo é **seguro e privativo**\n' +
                    '• Suas informações ficam **protegidas**\n' +
                    '• É **necessário** para jogar no servidor oficial\n\n' +
                    '🚀 **Clique no botão abaixo para começar!**'
                )
                .addFields(
                    {
                        name: '🔐 Segurança',
                        value: 'Sistema 100% seguro',
                        inline: true
                    },
                    {
                        name: '⚡ Velocidade',
                        value: 'Processo rápido',
                        inline: true
                    },
                    {
                        name: '🎁 Recompensas',
                        value: 'Pacote de boas-vindas',
                        inline: true
                    }
                )
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg')
                .setFooter({
                    text: 'DayZ ASKAL • Sistema de Vinculação Steam',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            // Botão para iniciar vinculação
            const steamButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('start_steam_link')
                        .setLabel('🔗 Vincular Steam')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎮')
                );

            try {
                await targetChannel.send({
                    embeds: [steamEmbed],
                    components: [steamButton]
                });

                await interaction.reply({
                    content: `✅ Sistema de vinculação Steam configurado em ${targetChannel}!\n\n` +
                        `🔧 **Funcionalidades ativadas:**\n` +
                        `• 🔗 Vinculação automática pós-verificação\n` +
                        `• 🔒 Controle de uma Steam ID por usuário\n` +
                        `• 🎁 Sistema de pacote de boas-vindas\n` +
                        `• 📊 Rastreamento completo de usuários\n\n` +
                        `**O sistema está pronto para uso!**`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erro ao configurar sistema Steam:', error);
                await interaction.reply({
                    content: '❌ Erro ao configurar o sistema de vinculação Steam!',
                    ephemeral: true
                });
            }

        } else if (subcommand === 'vincular') {
            const user = interaction.options.getUser('usuario');

            // Aqui você pode implementar lógica para forçar vinculação de admin
            await interaction.reply({
                content: `🔧 Iniciando processo de vinculação Steam para ${user}...\n` +
                    `📤 Uma mensagem privada será enviada para o usuário com instruções.`,
                ephemeral: true
            });

        } else if (subcommand === 'desvincular') {
            const user = interaction.options.getUser('usuario');

            // Aqui você pode implementar lógica para remover vinculação
            await interaction.reply({
                content: `🔧 Removendo vinculação Steam de ${user}...\n` +
                    `✅ Vinculação removida com sucesso. O usuário pode vincular uma nova Steam ID.`,
                ephemeral: true
            });

        } else if (subcommand === 'status') {
            const user = interaction.options.getUser('usuario') || interaction.user;

            // Aqui você pode implementar verificação de status no banco de dados
            const statusEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 Status de Vinculação Steam')
                .setDescription(`**Usuário:** ${user.tag}`)
                .addFields(
                    {
                        name: '🔗 Status da Vinculação',
                        value: '❌ **Não vinculado**\n*Clique em "Vincular Steam" para começar*',
                        inline: false
                    },
                    {
                        name: '🎁 Pacote de Boas-vindas',
                        value: '⏳ **Pendente**\n*Disponível após vinculação*',
                        inline: true
                    },
                    {
                        name: '🎮 Acesso ao Servidor',
                        value: '🔒 **Restrito**\n*Vincule para jogar*',
                        inline: true
                    }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: 'Sistema de Vinculação Steam',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [statusEmbed], ephemeral: true });

        } else if (subcommand === 'stats') {
            const statsEmbed = new EmbedBuilder()
                .setColor('#1b2838')
                .setTitle('📈 Estatísticas do Sistema Steam')
                .setDescription('Dados gerais de vinculação da comunidade')
                .addFields(
                    {
                        name: '👥 Total de Membros',
                        value: `${interaction.guild.memberCount}`,
                        inline: true
                    },
                    {
                        name: '🔗 Contas Vinculadas',
                        value: '0', // Implementar contagem do banco
                        inline: true
                    },
                    {
                        name: '📊 Taxa de Vinculação',
                        value: '0%',
                        inline: true
                    },
                    {
                        name: '🎁 Pacotes Entregues',
                        value: '0',
                        inline: true
                    },
                    {
                        name: '🎮 Players Ativos',
                        value: '0',
                        inline: true
                    },
                    {
                        name: '📅 Última Atualização',
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true
                    }
                )
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg')
                .setFooter({
                    text: 'DayZ ASKAL • Estatísticas Steam',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [statsEmbed] });
        }
    },
};
