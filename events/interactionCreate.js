const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Processar comandos slash
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`Comando ${interaction.commandName} não encontrado.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro ao executar comando ${interaction.commandName}:`, error);

                const errorMessage = {
                    content: '❌ Houve um erro ao executar este comando!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
            return;
        }

        // Processar botões de ticket
        if (interaction.isButton()) {
            // Botões para criar tickets
            if (interaction.customId.startsWith('ticket_')) {
                await handleTicketCreation(interaction);
                return;
            }

            // Botão para fechar ticket
            if (interaction.customId === 'close_ticket') {
                await handleTicketClose(interaction);
                return;
            }

            // Botões de confirmação de fechamento
            if (interaction.customId === 'confirm_close' || interaction.customId === 'cancel_close') {
                await handleTicketConfirmation(interaction);
                return;
            }

            // Botão de verificação de regras
            if (interaction.customId === 'verify_rules') {
                await handleRulesVerification(interaction);
                return;
            }

            // Botão para iniciar vinculação Steam
            if (interaction.customId === 'start_steam_link') {
                await handleSteamLinkStart(interaction);
                return;
            }

            // Botões de confirmação Steam
            if (interaction.customId.startsWith('steam_')) {
                await handleSteamLinkProcess(interaction);
                return;
            }
        }
    },
};

// Função para criar tickets
async function handleTicketCreation(interaction) {
    const ticketType = interaction.customId.split('_')[1];
    const member = interaction.member;
    const guild = interaction.guild;

    // IDs das configurações
    const SUPPORT_CATEGORY_ID = process.env.SUPPORT_CATEGORY_ID || '1401006875268350082';
    const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

    // Verificar se o usuário já tem um ticket aberto
    const existingTicket = guild.channels.cache.find(channel =>
        channel.name === `📃┃Atendimento-${member.user.username.toLowerCase()}` ||
        channel.topic?.includes(member.id)
    );

    if (existingTicket) {
        await interaction.reply({
            content: `❌ Você já possui um ticket aberto: ${existingTicket}`,
            ephemeral: true
        });
        return;
    }

    // Configurações por tipo de ticket
    const ticketConfigs = {
        suporte: {
            name: '🎮-suporte-geral',
            color: '#0099ff',
            title: '🎮 Suporte Geral - DayZ RP',
            description: 'Descreva sua dúvida sobre gameplay, mecânicas do servidor ou whitelisting.',
            category: 'Suporte Geral'
        },
        denuncia: {
            name: '📋-denuncia',
            color: '#ff0000',
            title: '📋 Denúncia - DayZ RP',
            description: 'Forneça detalhes sobre a denúncia (jogador, situação, evidências).',
            category: 'Denúncia'
        },
        bug: {
            name: '🐛-bug-report',
            color: '#ff6600',
            title: '🐛 Reportar Bug - DayZ RP',
            description: 'Descreva o bug encontrado, como reproduzir e impacto no gameplay.',
            category: 'Bug Report'
        },
        feedback: {
            name: '💭-feedback',
            color: '#00ff00',
            title: '💭 Feedback - DayZ RP',
            description: 'Compartilhe suas sugestões, críticas ou ideias para melhorar o servidor.',
            category: 'Feedback'
        },
        appeal: {
            name: '⚖️-appeal',
            color: '#800080',
            title: '⚖️ Recurso/Appeal - DayZ RP',
            description: 'Conteste sua punição fornecendo sua versão dos fatos e evidências.',
            category: 'Appeal'
        },
        outros: {
            name: '❓-outros',
            color: '#808080',
            title: '❓ Outros Assuntos - DayZ RP',
            description: 'Descreva sua questão ou necessidade.',
            category: 'Outros'
        }
    };

    const config = ticketConfigs[ticketType];
    if (!config) return;

    try {
        // Criar canal do ticket
        const permissionOverwrites = [
            {
                id: guild.id, // @everyone
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: member.id, // Usuário que abriu
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ];

        // Adicionar role da staff se existir
        if (STAFF_ROLE_ID) {
            permissionOverwrites.push({
                id: STAFF_ROLE_ID,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageMessages
                ]
            });
        }

        const ticketChannel = await guild.channels.create({
            name: `⚠️|Atendimento|${member.user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: SUPPORT_CATEGORY_ID,
            topic: `Ticket de ${config.category} - Usuário: ${member.id}`,
            permissionOverwrites
        });

        // Embed do ticket
        const ticketEmbed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle(config.title)
            .setDescription(
                `**Olá ${member}, bem-vindo ao seu ticket!**\n\n` +
                `${config.description}\n\n` +
                `**📋 Informações importantes:**\n` +
                `• Seja claro e detalhado em sua explicação\n` +
                `• Aguarde a resposta da equipe\n` +
                `• Use o botão abaixo para fechar quando resolvido\n\n` +
                `**🕐 Ticket criado:** <t:${Math.floor(Date.now() / 1000)}:F>`
            )
            .addFields(
                {
                    name: '🎭 Servidor',
                    value: 'DayZ RP - Mapa Deerisle',
                    inline: true
                },
                {
                    name: '📂 Categoria',
                    value: config.category,
                    inline: true
                },
                {
                    name: '👤 Criado por',
                    value: member.toString(),
                    inline: true
                }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: 'DayZ RP • Sistema de Tickets',
                iconURL: guild.iconURL()
            })
            .setTimestamp();

        // Botão para fechar ticket
        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Fechar Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        // Conteúdo da mensagem
        let messageContent = `${member}`;
        if (STAFF_ROLE_ID) {
            messageContent += ` | <@&${STAFF_ROLE_ID}>`;
        }

        // Enviar mensagem inicial no ticket
        await ticketChannel.send({
            content: messageContent,
            embeds: [ticketEmbed],
            components: [closeButton]
        });

        // Responder ao usuário
        await interaction.reply({
            content: `✅ Ticket criado com sucesso! ${ticketChannel}`,
            ephemeral: true
        });

        console.log(`✅ Ticket criado: ${ticketChannel.name} por ${member.user.tag}`);

    } catch (error) {
        console.error('Erro ao criar ticket:', error);
        await interaction.reply({
            content: '❌ Erro ao criar o ticket. Tente novamente ou contate um administrador.',
            ephemeral: true
        });
    }
}

// Função para iniciar fechamento de ticket
async function handleTicketClose(interaction) {
    const member = interaction.member;
    const channel = interaction.channel;

    // Verificar se está em um canal de ticket
    if (!channel.name.startsWith('⚠️|Atendimento|') || !channel.topic?.includes('Ticket de')) {
        await interaction.reply({
            content: '❌ Este botão só funciona em canais de ticket!',
            ephemeral: true
        });
        return;
    }

    // Embed de confirmação
    const confirmEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Confirmar Fechamento')
        .setDescription(
            `**${member}, você tem certeza que deseja fechar este ticket?**\n\n` +
            `🔒 O canal será deletado em 10 segundos após a confirmação.\n` +
            `💾 As mensagens serão perdidas permanentemente.\n\n` +
            `**Use os botões abaixo para confirmar ou cancelar:**`
        )
        .setFooter({
            text: 'Esta ação não pode ser desfeita',
            iconURL: interaction.guild.iconURL()
        })
        .setTimestamp();

    // Botões de confirmação
    const confirmRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`confirm_close_${member.id}`)
                .setLabel('✅ Confirmar Fechamento')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`cancel_close_${member.id}`)
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: false
    });
}

// Função para confirmar fechamento de ticket
async function handleTicketConfirmation(interaction) {
    const [action, , userId] = interaction.customId.split('_');
    const member = interaction.member;
    const channel = interaction.channel;

    // Verificar se é o usuário correto
    if (member.id !== userId) {
        await interaction.reply({
            content: '❌ Você não pode usar este botão!',
            ephemeral: true
        });
        return;
    }

    if (action === 'confirm') {
        // Arquivar e fechar ticket
        const archiveChannelId = process.env.ARCHIVE_CHANNEL_ID || '1402011860575719535';
        const archiveChannel = interaction.guild.channels.cache.get(archiveChannelId);

        if (archiveChannel) {
            try {
                // Buscar todas as mensagens do ticket
                const messages = await channel.messages.fetch({ limit: 100 });
                const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

                // Criar embed com resumo do ticket
                const archiveEmbed = new EmbedBuilder()
                    .setColor('#9932cc')
                    .setTitle('📁 Ticket Arquivado')
                    .setDescription(
                        `**Canal:** ${channel.name}\n` +
                        `**Fechado por:** ${member.tag}\n` +
                        `**Data de fechamento:** <t:${Math.floor(Date.now() / 1000)}:F>\n` +
                        `**Total de mensagens:** ${sortedMessages.size}`
                    )
                    .addFields(
                        {
                            name: '📂 Categoria',
                            value: channel.topic?.split(' - ')[0] || 'Não especificada',
                            inline: true
                        },
                        {
                            name: '👤 Usuário',
                            value: `<@${channel.topic?.split('Usuário: ')[1] || 'Desconhecido'}>`,
                            inline: true
                        },
                        {
                            name: '🕐 Duração',
                            value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`,
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
                let transcript = `TRANSCRIPT DO TICKET: ${channel.name}\n`;
                transcript += `Servidor: ${interaction.guild.name}\n`;
                transcript += `Categoria: ${channel.topic?.split(' - ')[0] || 'Não especificada'}\n`;
                transcript += `Criado em: ${new Date(channel.createdTimestamp).toLocaleString('pt-BR')}\n`;
                transcript += `Fechado em: ${new Date().toLocaleString('pt-BR')}\n`;
                transcript += `Fechado por: ${member.tag}\n`;
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
                    content: `📄 **Transcript completo do ticket ${channel.name}**`,
                    files: [{
                        attachment: transcriptBuffer,
                        name: `ticket-${channel.name}-${Date.now()}.txt`
                    }]
                });

                console.log(`✅ Ticket arquivado: ${channel.name} -> ${archiveChannel.name}`);
            } catch (error) {
                console.error('Erro ao arquivar ticket:', error);
                // Se der erro no arquivamento, ainda assim fechar o ticket
            }
        } else {
            console.warn('Canal de arquivo não encontrado, ticket será deletado normalmente');
        }

        // Mostrar mensagem de fechamento
        const closeEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🔒 Ticket Fechado')
            .setDescription(
                `**Ticket fechado por:** ${member.tag}\n` +
                `**Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                `📁 **Ticket arquivado com sucesso!**\n` +
                `🗑️ **Este canal será deletado em 10 segundos...**`
            )
            .setFooter({
                text: 'DayZ RP • Sistema de Tickets',
                iconURL: interaction.guild.iconURL()
            });

        await interaction.update({
            embeds: [closeEmbed],
            components: []
        });

        // Deletar canal após 10 segundos
        setTimeout(async () => {
            try {
                await channel.delete();
                console.log(`✅ Ticket fechado e deletado: ${channel.name} por ${member.tag}`);
            } catch (error) {
                console.error('Erro ao deletar canal de ticket:', error);
            }
        }, 10000);

    } else if (action === 'cancel') {
        // Cancelar fechamento
        const cancelEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Cancelado')
            .setDescription('O fechamento do ticket foi cancelado. Você pode continuar conversando aqui.')
            .setFooter({
                text: 'Use o botão 🔒 Fechar Ticket quando quiser fechar novamente'
            });

        await interaction.update({
            embeds: [cancelEmbed],
            components: []
        });

        // Remover a mensagem de cancelamento após 5 segundos
        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (error) {
                console.error('Erro ao deletar mensagem de cancelamento:', error);
            }
        }, 5000);
    }
}

// Função para processar verificação de regras
async function handleRulesVerification(interaction) {
    const member = interaction.member;
    const guild = interaction.guild;

    // IDs das configurações
    const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID || '1401003696518856786';
    const LOG_CHANNEL_ID = process.env.VERIFICATION_CHANNEL_ID || '1401005726847209604';

    try {
        // Buscar o cargo de verificado
        const verifiedRole = guild.roles.cache.get(VERIFIED_ROLE_ID);

        if (!verifiedRole) {
            await interaction.reply({
                content: '❌ Erro: Cargo de verificado não encontrado. Contate um administrador.',
                ephemeral: true
            });
            return;
        }

        // Verificar se o usuário já tem o cargo
        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await interaction.reply({
                content: '✅ Você já está verificado! Você já tem acesso a todas as áreas do servidor.',
                ephemeral: true
            });
            return;
        }

        // Adicionar o cargo ao usuário
        await member.roles.add(verifiedRole);

        // Criar embed de confirmação
        const verificationEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Verificação Concluída!')
            .setDescription(
                `**Parabéns ${member}!**\n\n` +
                `🎉 Você foi verificado com sucesso!\n` +
                `📖 Obrigado por ler as regras do servidor.\n\n` +
                `**🎮 Agora você tem acesso a:**\n` +
                `• 💬 Canais de chat geral\n` +
                `• 🎫 Sistema de tickets para suporte\n` +
                `• 📊 Informações do servidor\n` +
                `• 🎭 Atividades de roleplay\n\n` +
                `**� PRÓXIMO PASSO IMPORTANTE:**\n` +
                `🎮 **Vincule sua conta Steam** para receber:\n` +
                `• 🎁 **Pacote de boas-vindas** no servidor\n` +
                `• 🔒 **Acesso total** aos servidores DayZ\n` +
                `• 🏆 **Benefícios exclusivos** da comunidade\n\n` +
                `**�📋 Próximos passos:**\n` +
                `• Explore os canais disponíveis\n` +
                `• **VINCULE SUA STEAM** (altamente recomendado)\n` +
                `• Entre no jogo e divirta-se!\n\n` +
                `**Bem-vindo ao DayZ ASKAL!** �`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: 'DayZ ASKAL • Sistema de Verificação',
                iconURL: guild.iconURL()
            })
            .setTimestamp();

        // Botão para vinculação Steam
        const steamLinkButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_steam_link')
                    .setLabel('🎮 Vincular Steam Agora')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔗')
            );

        // Responder ao usuário
        await interaction.reply({
            embeds: [verificationEmbed],
            components: [steamLinkButton],
            ephemeral: true
        });

        // Log no canal de verificação
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📋 Nova Verificação')
                .setDescription(`${member} foi verificado com sucesso!`)
                .addFields(
                    {
                        name: '👤 Usuário',
                        value: `${member.user.tag} (${member.id})`,
                        inline: true
                    },
                    {
                        name: '⏰ Data',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: true
                    },
                    {
                        name: '🎭 Cargo Adicionado',
                        value: verifiedRole.toString(),
                        inline: true
                    }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: 'Sistema de Verificação',
                    iconURL: guild.iconURL()
                })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        console.log(`✅ Usuário verificado: ${member.user.tag} (${member.id})`);

    } catch (error) {
        console.error('Erro ao verificar usuário:', error);

        await interaction.reply({
            content: '❌ Erro ao processar verificação. Tente novamente ou contate um administrador.',
            ephemeral: true
        });
    }
}

// Função para iniciar processo de vinculação Steam
async function handleSteamLinkStart(interaction) {
    const member = interaction.member;
    const guild = interaction.guild;

    try {
        // Embed explicativo do processo Steam
        const steamProcessEmbed = new EmbedBuilder()
            .setColor('#1b2838')
            .setTitle('🎮 Vinculação Steam - Processo Seguro')
            .setDescription(
                `**${member}, vamos vincular sua conta Steam!**\n\n` +
                `🔒 **Como funciona:**\n` +
                `1. Você receberá uma **mensagem privada** com um link seguro\n` +
                `2. Faça login na **Steam** através do link oficial\n` +
                `3. Autorize a **vinculação** com a comunidade ASKAL\n` +
                `4. Receba seu **pacote de boas-vindas** automaticamente\n\n` +
                `🎁 **Seus benefícios incluem:**\n` +
                `• **Kits de início** no servidor DayZ\n` +
                `• **Acesso VIP temporário** (7 dias)\n` +
                `• **Prioridade** na fila do servidor\n` +
                `• **Cargo especial** no Discord\n` +
                `• **Proteção anti-ban** por acidentes\n\n` +
                `⚠️ **Importante:**\n` +
                `• Uma Steam ID por Discord (controle total)\n` +
                `• Processo 100% seguro via API oficial Steam\n` +
                `• Suas informações ficam protegidas\n\n` +
                `**Confirme abaixo para começar!**`
            )
            .addFields(
                {
                    name: '🔐 Segurança',
                    value: 'OAuth2 Steam oficial',
                    inline: true
                },
                {
                    name: '⚡ Velocidade',
                    value: 'Processo em 30 segundos',
                    inline: true
                },
                {
                    name: '🎁 Recompensas',
                    value: 'Imediatas no servidor',
                    inline: true
                }
            )
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg')
            .setFooter({
                text: 'DayZ ASKAL • Vinculação Steam Segura',
                iconURL: guild.iconURL()
            })
            .setTimestamp();

        // Botões de confirmação
        const confirmButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`steam_confirm_${member.id}`)
                    .setLabel('✅ Sim, quero vincular!')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔗'),
                new ButtonBuilder()
                    .setCustomId(`steam_cancel_${member.id}`)
                    .setLabel('❌ Talvez depois')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏭️')
            );

        await interaction.reply({
            embeds: [steamProcessEmbed],
            components: [confirmButtons],
            ephemeral: true
        });

    } catch (error) {
        console.error('Erro ao iniciar vinculação Steam:', error);
        await interaction.reply({
            content: '❌ Erro ao iniciar vinculação Steam. Tente novamente.',
            ephemeral: true
        });
    }
}

// Função para processar confirmação/cancelamento Steam
async function handleSteamLinkProcess(interaction) {
    const [action, , userId] = interaction.customId.split('_');
    const member = interaction.member;

    // Verificar se é o usuário correto
    if (member.id !== userId) {
        await interaction.reply({
            content: '❌ Você não pode usar este botão!',
            ephemeral: true
        });
        return;
    }

    if (action === 'steam' && interaction.customId.includes('confirm')) {
        // Processar confirmação da vinculação
        try {
            // Verificar se já está vinculado
            const SteamDatabase = require('../utils/steamDatabase.js');
            const steamDB = new SteamDatabase();

            // Aguardar carregamento dos dados
            await steamDB.loadData();

            if (steamDB.isDiscordLinked(member.id)) {
                await interaction.update({
                    content: '⚠️ Você já possui uma conta Steam vinculada!',
                    embeds: [],
                    components: []
                });
                return;
            }

            // Gerar link real do Steam OAuth2
            const SteamAuth = require('../utils/steamAuth.js');
            const steamAuth = new SteamAuth();
            const authUrl = steamAuth.generateAuthUrl(member.id);

            const steamLinkEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔗 Link de Vinculação Steam Gerado!')
                .setDescription(
                    `**${member}, seu link personalizado foi criado!**\n\n` +
                    `📩 **Enviamos uma mensagem privada** com:\n` +
                    `• 🔗 Link Steam OAuth2 oficial e seguro\n` +
                    `• 📋 Instruções detalhadas do processo\n` +
                    `• 🔒 Código de segurança único\n\n` +
                    `⚠️ **Se não recebeu a mensagem:**\n` +
                    `• Verifique se suas **DMs estão abertas**\n` +
                    `• Procure na pasta **"Solicitações de Mensagem"**\n` +
                    `• Entre em contato com a **staff** se necessário\n\n` +
                    `🕐 **O link expira em 15 minutos por segurança**`
                )
                .setFooter({
                    text: 'DayZ ASKAL • Link Steam Real Gerado',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            await interaction.update({
                embeds: [steamLinkEmbed],
                components: []
            });

            // Tentar enviar DM com link real
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#1b2838')
                    .setTitle('🎮 Vinculação Steam - Link Oficial')
                    .setDescription(
                        `**Olá ${member.displayName}!**\n\n` +
                        `🔗 **Clique no link abaixo para vincular sua Steam:**\n\n` +
                        `**🚀 [CLIQUE AQUI PARA VINCULAR SUA STEAM](${authUrl})**\n\n` +
                        `\`\`\`\n${authUrl}\n\`\`\`\n\n` +
                        `**📋 Processo:**\n` +
                        `1. **Clique no link** acima (Steam oficial)\n` +
                        `2. **Faça login** na sua conta Steam\n` +
                        `3. **Autorize** a aplicação DayZ ASKAL\n` +
                        `4. **Aguarde** a confirmação automática\n\n` +
                        `🎁 **Após vincular você receberá:**\n` +
                        `• Kit de boas-vindas no servidor DayZ\n` +
                        `• Cargo especial no Discord\n` +
                        `• Acesso VIP temporário (7 dias)\n` +
                        `• Prioridade na fila do servidor\n\n` +
                        `🔒 **Código de Segurança:** \`ASKAL-${Date.now().toString(36).toUpperCase()}\`\n\n` +
                        `⚠️ **Este link expira em 15 minutos**\n` +
                        `💬 **Dúvidas? Use o sistema de tickets**`
                    )
                    .setFooter({
                        text: 'DayZ ASKAL • Steam OAuth2 Oficial',
                        iconURL: interaction.guild.iconURL()
                    })
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] });
                console.log(`✅ DM com link Steam real enviada para ${member.user.tag}`);
                console.log(`🔗 Link gerado: ${authUrl}`);

            } catch (dmError) {
                console.log(`❌ Erro ao enviar DM para ${member.user.tag}:`, dmError.message);

                // Se não conseguir enviar DM, avisar no canal
                setTimeout(async () => {
                    const failEmbed = new EmbedBuilder()
                        .setColor('#ff9900')
                        .setTitle('⚠️ Problema com Mensagem Privada')
                        .setDescription(
                            `**${member}, não conseguimos enviar a mensagem privada!**\n\n` +
                            `🔧 **Para resolver:**\n` +
                            `• Abra suas **configurações de privacidade**\n` +
                            `• Permita **mensagens diretas** de membros do servidor\n` +
                            `• Clique em **"Vincular Steam Agora"** novamente\n\n` +
                            `📞 **Ou entre em contato com a staff pelo sistema de tickets**`
                        )
                        .setFooter({ text: 'Problema de Privacidade - DM Bloqueada' });

                    await interaction.followUp({
                        embeds: [failEmbed],
                        ephemeral: true
                    });
                }, 2000);
            }

        } catch (error) {
            console.error('Erro no processo de vinculação Steam:', error);
            console.error('Stack trace:', error.stack);

            let errorMessage = '❌ Erro no processo de vinculação.';

            if (error.message.includes('getUserSteamId is not a function')) {
                errorMessage += ' Erro de função não encontrada.';
            } else if (error.message.includes('Cannot read properties')) {
                errorMessage += ' Erro de propriedade não encontrada.';
            } else if (error.message.includes('require')) {
                errorMessage += ' Erro ao carregar módulo.';
            }

            errorMessage += ' Contate um administrador.';

            try {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            } catch (replyError) {
                console.error('Erro ao enviar resposta de erro:', replyError);
                try {
                    await interaction.update({
                        content: errorMessage,
                        embeds: [],
                        components: []
                    });
                } catch (updateError) {
                    console.error('Erro ao atualizar mensagem de erro:', updateError);
                }
            }
        }

    } else if (action === 'steam' && interaction.customId.includes('cancel')) {
        // Processar cancelamento
        const cancelEmbed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('⏭️ Vinculação Adiada')
            .setDescription(
                `**Sem problemas, ${member}!**\n\n` +
                `🕐 **Você pode vincular sua Steam a qualquer momento:**\n` +
                `• Use o comando \`/steam vincular\`\n` +
                `• Ou clique no botão de vinculação no canal principal\n\n` +
                `💡 **Lembre-se dos benefícios:**\n` +
                `• 🎁 Pacote de boas-vindas no servidor\n` +
                `• 🔒 Segurança e controle total\n` +
                `• 🏆 Acesso a benefícios exclusivos\n\n` +
                `**Aproveite a comunidade ASKAL!** 🎮`
            )
            .setFooter({
                text: 'DayZ ASKAL • Vinculação Steam Disponível',
                iconURL: interaction.guild.iconURL()
            });

        await interaction.update({
            embeds: [cancelEmbed],
            components: []
        });

        console.log(`📝 ${member.user.tag} adiou a vinculação Steam`);
    }
}
