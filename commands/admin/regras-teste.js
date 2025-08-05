const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('regras-teste')
        .setDescription('Cria regras temporárias para teste do sistema de verificação')
        .addChannelOption(option =>
            option
                .setName('canal')
                .setDescription('Canal onde enviar as regras (padrão: canal de regras)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.options.getChannel('canal');
        const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || '1401005418632843364';
        const targetChannel = channel || interaction.guild.channels.cache.get(RULES_CHANNEL_ID);

        if (!targetChannel) {
            await interaction.reply({
                content: '❌ Canal de regras não encontrado!',
                ephemeral: true
            });
            return;
        }

        try {
            // Embed de introdução
            const introEmbed = new EmbedBuilder()
                .setColor('#ff6b35')
                .setTitle('📋 REGRAS DA COMUNIDADE - DayZ ASKAL')
                .setDescription(
                    '**� Bem-vindo à Comunidade DayZ ASKAL!**\n\n' +
                    'Somos uma comunidade dedicada ao DayZ que abrange Discord, grupos de mensagens, ' +
                    'área VIP e todas as nossas redes sociais. Para garantir um ambiente saudável ' +
                    'e respeitoso para todos os membros, é fundamental que você leia e siga ' +
                    'todas as regras abaixo.\n\n' +
                    '⚠️ **O desconhecimento das regras não isenta de punição!**\n' +
                    '🌐 **Estas regras se aplicam a TODOS os espaços da comunidade ASKAL**'
                )
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({
                    text: 'Comunidade DayZ ASKAL • Regras Globais',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            // Regras Gerais de Convivência
            const generalRulesEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🤝 1. REGRAS GERAIS DE CONVIVÊNCIA')
                .setDescription(
                    '**1.1** - Trate todos os membros com respeito e cordialidade\n' +
                    '**1.2** - Proibido discriminação por raça, religião, gênero ou orientação sexual\n' +
                    '**1.3** - Mantenha um vocabulário adequado e civilizado\n' +
                    '**1.4** - Não faça spam, flood ou mensagens excessivas\n' +
                    '**1.5** - Proibido compartilhar conteúdo ofensivo, NSFW ou ilegal\n' +
                    '**1.6** - Respeite as opiniões diferentes, mesmo que discorde\n' +
                    '**1.7** - Evite discussões políticas ou religiosas polêmicas\n' +
                    '**1.8** - Use bom senso em todas as suas interações'
                )
                .setFooter({ text: 'Seção 1/5 • Continue lendo...' });

            // Regras da Comunidade Digital
            const digitalRulesEmbed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('💬 2. REGRAS DA COMUNIDADE DIGITAL')
                .setDescription(
                    '**2.1** - Use os canais apropriados para cada tipo de conversa\n' +
                    '**2.2** - No Discord: respeite as categorias e canais específicos\n' +
                    '**2.3** - Nos grupos de WhatsApp: mantenha o foco no assunto do grupo\n' +
                    '**2.4** - Proibido divulgação de outros servidores/comunidades sem autorização\n' +
                    '**2.5** - Não faça menções desnecessárias (@everyone, @here, @staff)\n' +
                    '**2.6** - Evite conversas paralelas em canais públicos\n' +
                    '**2.7** - Use emojis e reações com moderação\n' +
                    '**2.8** - Mantenha seu nickname apropriado e identificável'
                )
                .setFooter({ text: 'Seção 2/5 • Continue lendo...' });

            // Regras do Grupo VIP e Benefícios
            const vipRulesEmbed = new EmbedBuilder()
                .setColor('#f39c12')
                .setTitle('👑 3. REGRAS DO GRUPO VIP E BENEFÍCIOS')
                .setDescription(
                    '**3.1** - O acesso VIP é um privilégio, não um direito\n' +
                    '**3.2** - Mantenha ainda mais respeito e cordialidade na área VIP\n' +
                    '**3.3** - Não compartilhe informações exclusivas fora do grupo VIP\n' +
                    '**3.4** - Abuse dos benefícios pode resultar em perda do status VIP\n' +
                    '**3.5** - Seja um exemplo positivo para outros membros\n' +
                    '**3.6** - Ajude novos membros quando possível\n' +
                    '**3.7** - Respeite os limites de uso dos benefícios VIP\n' +
                    '**3.8** - Contribua construtivamente para a comunidade'
                )
                .setFooter({ text: 'Seção 3/5 • Continue lendo...' });

            // Regras de Redes Sociais e Representação
            const socialRulesEmbed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('📱 4. REGRAS DE REDES SOCIAIS E REPRESENTAÇÃO')
                .setDescription(
                    '**4.1** - Ao representar a comunidade ASKAL, mantenha postura adequada\n' +
                    '**4.2** - Não crie drama ou polêmicas envolvendo o nome ASKAL\n' +
                    '**4.3** - Em redes sociais, seja respeitoso ao mencionar a comunidade\n' +
                    '**4.4** - Não use a tag ASKAL para fins pessoais inadequados\n' +
                    '**4.5** - Compartilhe conteúdo positivo sobre a comunidade\n' +
                    '**4.6** - Evite exposição negativa da comunidade em outras plataformas\n' +
                    '**4.7** - Colabore para manter a boa reputação da ASKAL\n' +
                    '**4.8** - Denuncie comportamentos inadequados à administração'
                )
                .setFooter({ text: 'Seção 4/5 • Continue lendo...' });

            // Regras de Punição e Moderação
            const punishmentRulesEmbed = new EmbedBuilder()
                .setColor('#e67e22')
                .setTitle('⚖️ 5. SISTEMA DE PUNIÇÕES E MODERAÇÃO')
                .setDescription(
                    '**5.1** - **Advertência:** Primeira quebra de regra ou comportamento inadequado\n' +
                    '**5.2** - **Silenciamento Temporário:** Spam, flood ou desrespeito\n' +
                    '**5.3** - **Remoção de Benefícios:** Abuso de privilégios VIP\n' +
                    '**5.4** - **Kick/Timeout:** Comportamento inadequado persistente\n' +
                    '**5.5** - **Ban Temporário:** Quebras graves ou reincidência\n' +
                    '**5.6** - **Ban Permanente:** Quebras muito graves ou múltiplas reincidências\n\n' +
                    '**📋 Processo de Recurso:**\n' +
                    '• Use o sistema de tickets para contestar punições\n' +
                    '• Apresente evidências e sua versão dos fatos de forma respeitosa\n' +
                    '• A decisão final sempre cabe à administração\n\n' +
                    '**⚠️ Observações importantes:**\n' +
                    '• Punições se aplicam a TODOS os espaços da comunidade\n' +
                    '• Tentativas de burlar punições resultam em ban permanente\n' +
                    '• A staff tem autonomia para aplicar punições adequadas à situação'
                )
                .setFooter({ text: 'Seção 5/5 • Todas as regras foram apresentadas' });

            // Embed final
            const finalEmbed = new EmbedBuilder()
                .setColor('#27ae60')
                .setTitle('✅ CONCLUSÃO DAS REGRAS DA COMUNIDADE')
                .setDescription(
                    '**🎉 Parabéns por chegar até o final!**\n\n' +
                    'Você acabou de ler todas as regras da Comunidade DayZ ASKAL. ' +
                    'Estas regras garantem um ambiente saudável, respeitoso e divertido ' +
                    'para todos os membros em TODOS os nossos espaços.\n\n' +
                    '**📝 Para se verificar e ter acesso completo:**\n' +
                    '• Certifique-se de que compreendeu todas as regras\n' +
                    '• Clique no botão "Li e aceito as regras" abaixo\n' +
                    '• Aguarde receber o cargo de verificado automaticamente\n\n' +
                    '**🎮 Após a verificação você terá acesso a:**\n' +
                    '• Todos os canais da comunidade Discord\n' +
                    '• Grupos de WhatsApp da comunidade\n' +
                    '• Informações sobre servidores de DayZ\n' +
                    '• Sistema de tickets para suporte\n' +
                    '• Eventos e atividades exclusivas\n' +
                    '• Possibilidade de acesso VIP\n\n' +
                    '**� Bem-vindo à Comunidade DayZ ASKAL!**\n' +
                    'Esperamos que você tenha experiências incríveis conosco!'
                )
                .setFooter({
                    text: 'Comunidade DayZ ASKAL • Agora use /verificacao regras para adicionar o botão',
                    iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

            // Enviar todos os embeds
            await targetChannel.send({ embeds: [introEmbed] });
            await targetChannel.send({ embeds: [generalRulesEmbed] });
            await targetChannel.send({ embeds: [digitalRulesEmbed] });
            await targetChannel.send({ embeds: [vipRulesEmbed] });
            await targetChannel.send({ embeds: [socialRulesEmbed] });
            await targetChannel.send({ embeds: [punishmentRulesEmbed] });
            await targetChannel.send({ embeds: [finalEmbed] });

            await interaction.reply({
                content: `✅ **Regras da Comunidade ASKAL criadas com sucesso em ${targetChannel}!**\n\n` +
                    `📋 **As novas regras incluem:**\n` +
                    `• 🤝 Convivência geral da comunidade\n` +
                    `• 💬 Regras para Discord e grupos de mensagens\n` +
                    `• 👑 Diretrizes para membros VIP\n` +
                    `• 📱 Comportamento em redes sociais\n` +
                    `• ⚖️ Sistema de moderação global\n\n` +
                    `**Próximos passos:**\n` +
                    `1. Use \`/verificacao regras\` no canal para adicionar o botão\n` +
                    `2. Teste o sistema de verificação\n` +
                    `3. Verifique se tudo funciona corretamente\n\n` +
                    `🗑️ **Para limpar:** Delete as mensagens quando terminar os testes`,
                ephemeral: true
            });

            console.log(`✅ Regras da Comunidade ASKAL criadas em ${targetChannel.name} por ${interaction.user.tag}`);
        } catch (error) {
            console.error('Erro ao criar regras de teste:', error);
            await interaction.reply({
                content: '❌ Erro ao criar as regras de teste. Verifique as permissões do bot no canal.',
                ephemeral: true
            });
        }
    },
};
