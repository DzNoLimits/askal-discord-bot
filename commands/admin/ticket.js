const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistema de tickets de atendimento para DayZ RP')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configura o painel de tickets no canal')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Fecha um ticket')
                .addStringOption(option =>
                    option
                        .setName('motivo')
                        .setDescription('Motivo do fechamento')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('archive')
                .setDescription('Arquiva um ticket sem deletar (apenas staff)')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            // Canal onde será enviado o painel
            const TICKET_CHANNEL_ID = '1401007022958448752'; // Abrir Tíquete
            const ticketChannel = interaction.guild.channels.cache.get(TICKET_CHANNEL_ID);

            if (!ticketChannel) {
                await interaction.reply({
                    content: '❌ Canal de tickets não encontrado!',
                    ephemeral: true
                });
                return;
            }

            // Embed principal do painel
            const panelEmbed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('🎫 Sistema de Atendimento - ASKAL')
                .setDescription(
                    '**Bem-vindo ao sistema de suporte!**\n\n' +
                    '🏝️ Precisa de ajuda no servidor Deerisle?\n' +
                    '🎭 Problemas com RP ou regras?\n' +
                    '🐛 Encontrou bugs ou exploits?\n\n' +
                    '**Clique no botão correspondente ao seu problema:**'
                )
                .addFields(
                    {
                        name: '🎮 Suporte Geral',
                        value: 'Dúvidas sobre gameplay, mecânicas do servidor, whitelisting',
                        inline: true
                    },
                    {
                        name: '📋 Denúncias',
                        value: 'Reportar jogadores, quebra de RP, metagaming',
                        inline: true
                    },
                    {
                        name: '🐛 Bugs & Problemas',
                        value: 'Reportar bugs, problemas técnicos, exploits',
                        inline: true
                    },
                    {
                        name: '💭 Feedback',
                        value: 'Sugestões, reclamações, melhorias para o servidor',
                        inline: true
                    },
                    {
                        name: '⚖️ Recurso/Appeal',
                        value: 'Contestar punições, appeals de ban/kick',
                        inline: true
                    },
                    {
                        name: '❓ Outros',
                        value: 'Qualquer outro assunto não listado acima',
                        inline: true
                    }
                )
                .setThumbnail('https://cdn.discordapp.com/attachments/123456789/dayz-logo.png') // Placeholder
                .setFooter({
                    text: 'DayZ RP • Deerisle Server • Sistema de Tickets',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            // Botões do painel
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_suporte')
                        .setLabel('🎮 Suporte Geral')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('ticket_denuncia')
                        .setLabel('📋 Denúncias')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ticket_bug')
                        .setLabel('🐛 Bugs & Problemas')
                        .setStyle(ButtonStyle.Secondary)
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_feedback')
                        .setLabel('💭 Feedback')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('ticket_appeal')
                        .setLabel('⚖️ Recurso/Appeal')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ticket_outros')
                        .setLabel('❓ Outros')
                        .setStyle(ButtonStyle.Secondary)
                );

            try {
                await ticketChannel.send({
                    embeds: [panelEmbed],
                    components: [row1, row2]
                });

                await interaction.reply({
                    content: `✅ Painel de tickets configurado com sucesso em ${ticketChannel}!`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erro ao enviar painel de tickets:', error);
                await interaction.reply({
                    content: '❌ Erro ao configurar o painel de tickets!',
                    ephemeral: true
                });
            }

        } else if (subcommand === 'close') {
            const motivo = interaction.options.getString('motivo') || 'Sem motivo especificado';

            // Verificar se está em um canal de ticket
            if (!interaction.channel.name.startsWith('⚠️|Atendimento|')) {
                await interaction.reply({
                    content: '❌ Este comando só pode ser usado em canais de ticket!',
                    ephemeral: true
                });
                return;
            }

            const closeEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔒 Ticket Fechado')
                .setDescription(`**Ticket fechado por:** ${interaction.user.tag}`)
                .addFields(
                    {
                        name: '📝 Motivo',
                        value: motivo,
                        inline: false
                    },
                    {
                        name: '⏰ Fechado em',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: false
                    }
                )
                .setFooter({
                    text: 'DayZ RP • Sistema de Tickets',
                    iconURL: interaction.guild.iconURL()
                });

            await interaction.reply({ embeds: [closeEmbed] });

            // Aguardar 5 segundos e deletar o canal
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('Erro ao deletar canal de ticket:', error);
                }
            }, 5000);

        } else if (subcommand === 'archive') {
            // Verificar se está em um canal de ticket
            if (!interaction.channel.name.startsWith('⚠️|atendimento|') || !interaction.channel.topic?.includes('Ticket de')) {
                await interaction.reply({
                    content: '❌ Este comando só pode ser usado em canais de ticket!',
                    ephemeral: true
                });
                return;
            }

            const archiveChannelId = process.env.ARCHIVE_CHANNEL_ID || '1402011860575719535';
            const archiveChannel = interaction.guild.channels.cache.get(archiveChannelId);

            if (!archiveChannel) {
                await interaction.reply({
                    content: '❌ Canal de arquivo não encontrado!',
                    ephemeral: true
                });
                return;
            }

            await interaction.reply({
                content: '📁 Arquivando ticket... Por favor aguarde.',
                ephemeral: true
            });

            try {
                // Buscar todas as mensagens do ticket
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

                // Criar embed com resumo do ticket
                const archiveEmbed = new EmbedBuilder()
                    .setColor('#9932cc')
                    .setTitle('📁 Ticket Arquivado (Manual)')
                    .setDescription(
                        `**Canal:** ${interaction.channel.name}\n` +
                        `**Arquivado por:** ${interaction.user.tag}\n` +
                        `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n` +
                        `**Total de mensagens:** ${sortedMessages.size}`
                    )
                    .addFields(
                        {
                            name: '📂 Categoria',
                            value: interaction.channel.topic?.split(' - ')[0] || 'Não especificada',
                            inline: true
                        },
                        {
                            name: '👤 Usuário',
                            value: `<@${interaction.channel.topic?.split('Usuário: ')[1] || 'Desconhecido'}>`,
                            inline: true
                        },
                        {
                            name: '🕐 Duração',
                            value: `<t:${Math.floor(interaction.channel.createdTimestamp / 1000)}:R>`,
                            inline: true
                        }
                    )
                    .setFooter({
                        text: 'DayZ RP • Sistema de Arquivos',
                        iconURL: interaction.guild.iconURL()
                    })
                    .setTimestamp();

                // Enviar embed de resumo
                await archiveChannel.send({ embeds: [archiveEmbed] });

                // Criar arquivo de texto com o histórico de mensagens
                let transcript = `TRANSCRIPT DO TICKET: ${interaction.channel.name}\n`;
                transcript += `Servidor: ${interaction.guild.name}\n`;
                transcript += `Categoria: ${interaction.channel.topic?.split(' - ')[0] || 'Não especificada'}\n`;
                transcript += `Criado em: ${new Date(interaction.channel.createdTimestamp).toLocaleString('pt-BR')}\n`;
                transcript += `Arquivado em: ${new Date().toLocaleString('pt-BR')}\n`;
                transcript += `Arquivado por: ${interaction.user.tag}\n`;
                transcript += `${'='.repeat(60)}\n\n`;

                // Adicionar mensagens ao transcript
                for (const message of sortedMessages.values()) {
                    const timestamp = new Date(message.createdTimestamp).toLocaleString('pt-BR');
                    const author = message.author.tag;
                    const content = message.content || '[Conteúdo não textual]';

                    transcript += `[${timestamp}] ${author}: ${content}\n`;

                    // Adicionar anexos se houver
                    if (message.attachments.size > 0) {
                        transcript += `   Anexos: ${message.attachments.map(att => att.url).join(', ')}\n`;
                    }

                    // Adicionar embeds se houver
                    if (message.embeds.length > 0) {
                        transcript += `   [EMBED] ${message.embeds[0].title || 'Embed sem título'}\n`;
                    }

                    transcript += '\n';
                }

                // Criar buffer do arquivo
                const transcriptBuffer = Buffer.from(transcript, 'utf-8');

                // Enviar arquivo de transcript
                await archiveChannel.send({
                    content: `📄 **Transcript completo do ticket ${interaction.channel.name}** (Arquivado manualmente)`,
                    files: [{
                        attachment: transcriptBuffer,
                        name: `ticket-${interaction.channel.name}-${Date.now()}.txt`
                    }]
                });

                await interaction.editReply({
                    content: `✅ Ticket arquivado com sucesso em ${archiveChannel}!`
                });

                console.log(`✅ Ticket arquivado manualmente: ${interaction.channel.name} por ${interaction.user.tag}`);

            } catch (error) {
                console.error('Erro ao arquivar ticket:', error);
                await interaction.editReply({
                    content: '❌ Erro ao arquivar o ticket!'
                });
            }
        }
    },
};
