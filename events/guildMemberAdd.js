const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Canal específico para mensagens de boas-vindas
        const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || '1401005523859673129';
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

        if (!welcomeChannel) {
            console.log(`❌ Canal de boas-vindas (${WELCOME_CHANNEL_ID}) não encontrado`);
            return;
        }

        // Criar embed de boas-vindas
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Bem-vindo(a) ao servidor!')
            .setDescription(`Olá ${member}, seja muito bem-vindo(a) ao **${member.guild.name}**!`)
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
                    value: `#${member.guild.memberCount}`,
                    inline: true
                },
                {
                    name: '📋 Como começar',
                    value: '• Digite `/help` para ver os comandos\n• Leia as regras do servidor\n• Divirta-se!',
                    inline: false
                }
            )
            .setFooter({
                text: `${member.guild.name} • Sistema de Boas-vindas`,
                iconURL: member.guild.iconURL()
            })
            .setTimestamp();

        try {
            await welcomeChannel.send({ 
                content: `🎉 ${member} acabou de entrar no servidor!`,
                embeds: [welcomeEmbed] 
            });
            
            console.log(`✅ Mensagem de boas-vindas enviada para ${member.user.tag}`);
            
            // Opcional: Enviar DM privada para o novo membro
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`🎉 Bem-vindo(a) ao ${member.guild.name}!`)
                    .setDescription(
                        `Olá! Obrigado por entrar no nosso servidor.\n\n` +
                        `📋 **Dicas importantes:**\n` +
                        `• Use \`/help\` para ver todos os comandos\n` +
                        `• Respeite as regras do servidor\n` +
                        `• Divirta-se com a comunidade!\n\n` +
                        `Se tiver dúvidas, não hesite em perguntar!`
                    )
                    .setThumbnail(member.guild.iconURL())
                    .setFooter({
                        text: 'Mensagem automática do sistema',
                        iconURL: member.client.user.displayAvatarURL()
                    });

                await member.send({ embeds: [dmEmbed] });
                console.log(`✅ DM de boas-vindas enviada para ${member.user.tag}`);
            } catch (dmError) {
                console.log(`⚠️ Não foi possível enviar DM para ${member.user.tag} (DMs desabilitadas)`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
        }
    },
};
