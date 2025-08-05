const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificacao')
        .setDescription('Sistema de verificação de regras para DayZ RP')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configura o sistema de verificação')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal onde será enviado o sistema (padrão: canal de regras)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('regras')
                .setDescription('Adiciona botão de verificação ao canal de regras')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Mostra estatísticas de verificação')
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

            // Embed principal do sistema de verificação
            const verificationEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🛡️ Sistema de Verificação - ASKAL')
                .setDescription(
                    '**Bem-vindo ao servidor ASKAL!**\n\n' +
                    '🏝️ Para ter acesso completo ao servidor, você deve:\n\n' +
                    '**📋 PASSO 1:** Leia atentamente todas as regras em <#1401005418632843364>\n' +
                    '**✅ PASSO 2:** Clique no botão "Li e aceito as regras" ao final das regras\n' +
                    '**🎮 PASSO 3:** Aguarde receber o cargo de verificado automaticamente\n\n' +
                    '⚠️ **IMPORTANTE:**\n' +
                    '• Você deve ler TODAS as regras antes de clicar\n' +
                    '• O não cumprimento das regras resultará em punições\n' +
                    '• Este processo é obrigatório para todos os membros\n\n' +
                    '🎭 **Sobre o servidor:**\n' +
                    '• Mapa: Deerisle\n' +
                    '• Foco: Roleplay realista\n' +
                    '• Comunidade: BR/PT'
                )
                .addFields(
                    {
                        name: '📖 Regras do Servidor',
                        value: 'Acesse: <#1401005418632843364>',
                        inline: true
                    },
                    {
                        name: '🎫 Suporte',
                        value: 'Use: <#1401007022958448752>',
                        inline: true
                    },
                    {
                        name: '👋 Boas-vindas',
                        value: 'Veja: <#1401005523859673129>',
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({
                    text: 'ASKAL • Sistema de Verificação',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            try {
                await targetChannel.send({
                    embeds: [verificationEmbed]
                });

                await interaction.reply({
                    content: `✅ Sistema de verificação configurado em ${targetChannel}!\n\n**Próximo passo:** Use \`/verificacao regras\` no canal de regras para adicionar o botão de verificação.`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erro ao configurar verificação:', error);
                await interaction.reply({
                    content: '❌ Erro ao configurar o sistema de verificação!',
                    ephemeral: true
                });
            }

        } else if (subcommand === 'regras') {
            const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || '1401005418632843364';
            const rulesChannel = interaction.guild.channels.cache.get(RULES_CHANNEL_ID);

            if (!rulesChannel) {
                await interaction.reply({
                    content: '❌ Canal de regras não encontrado!',
                    ephemeral: true
                });
                return;
            }

            // Embed para ser adicionado ao final das regras
            const rulesVerificationEmbed = new EmbedBuilder()
                .setColor('#ff6b35')
                .setTitle('✅ Confirmação de Leitura das Regras')
                .setDescription(
                    '**🎯 Você chegou ao final das regras!**\n\n' +
                    '📖 Se você leu e compreendeu todas as regras acima, clique no botão abaixo para confirmar.\n\n' +
                    '⚠️ **ATENÇÃO:**\n' +
                    '• Ao clicar, você confirma que leu e aceita todas as regras\n' +
                    '• Você será responsabilizado por qualquer quebra de regra\n' +
                    '• O cargo de verificado será adicionado automaticamente\n\n' +
                    '🎮 **Após a verificação você terá acesso a:**\n' +
                    '• Canais de chat geral\n' +
                    '• Sistema de tickets\n' +
                    '• Canais de informações do servidor\n' +
                    '• Eventos e atividades'
                )
                .setFooter({
                    text: 'ASKAL • Verificação de Regras',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            // Botão de verificação
            const verificationButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_rules')
                        .setLabel('✅ Li e aceito as regras')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📖')
                );

            try {
                await rulesChannel.send({
                    embeds: [rulesVerificationEmbed],
                    components: [verificationButton]
                });

                await interaction.reply({
                    content: `✅ Botão de verificação adicionado ao canal ${rulesChannel}!\n\nOs usuários agora podem clicar para receber o cargo de verificado.`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erro ao adicionar botão de verificação:', error);
                await interaction.reply({
                    content: '❌ Erro ao adicionar o botão de verificação!',
                    ephemeral: true
                });
            }

        } else if (subcommand === 'stats') {
            const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || '1401003696518856786';
            const verifiedRole = interaction.guild.roles.cache.get(VERIFIED_ROLE_ID);

            if (!verifiedRole) {
                await interaction.reply({
                    content: '❌ Cargo de verificado não encontrado!',
                    ephemeral: true
                });
                return;
            }

            const totalMembers = interaction.guild.memberCount;
            const verifiedMembers = verifiedRole.members.size;
            const unverifiedMembers = totalMembers - verifiedMembers;
            const verificationRate = ((verifiedMembers / totalMembers) * 100).toFixed(1);

            const statsEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 Estatísticas de Verificação')
                .setDescription('Dados atuais do sistema de verificação do servidor')
                .addFields(
                    {
                        name: '👥 Total de Membros',
                        value: totalMembers.toString(),
                        inline: true
                    },
                    {
                        name: '✅ Verificados',
                        value: verifiedMembers.toString(),
                        inline: true
                    },
                    {
                        name: '❌ Não Verificados',
                        value: unverifiedMembers.toString(),
                        inline: true
                    },
                    {
                        name: '📈 Taxa de Verificação',
                        value: `${verificationRate}%`,
                        inline: true
                    },
                    {
                        name: '🎭 Cargo Verificado',
                        value: verifiedRole.toString(),
                        inline: true
                    },
                    {
                        name: '📅 Última Atualização',
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true
                    }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({
                    text: 'ASKAL • Sistema de Verificação',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [statsEmbed] });
        }
    },
};
