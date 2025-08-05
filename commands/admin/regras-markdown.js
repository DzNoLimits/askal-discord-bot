const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('regras-markdown')
        .setDescription('Cria regras da comunidade ASKAL em formato Markdown')
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
            // Dividir as regras em partes menores para não exceder o limite do Discord

            // Parte 1: Introdução
            const part1 = `
# 📋 REGRAS DA COMUNIDADE - DayZ ASKAL

## 🎮 Bem-vindo à Comunidade DayZ ASKAL!

Somos uma comunidade dedicada ao DayZ que abrange **Discord**, **grupos de mensagens**, **área VIP** e todas as nossas **redes sociais**. Para garantir um ambiente saudável e respeitoso para todos os membros, é fundamental que você leia e siga todas as regras abaixo.

⚠️ **O desconhecimento das regras não isenta de punição!**
🌐 **Estas regras se aplicam a TODOS os espaços da comunidade ASKAL**
`;

            // Parte 2: Regras de Convivência
            const part2 = `


## 🤝 1. REGRAS GERAIS DE CONVIVÊNCIA

**1.1** - Trate todos os membros com **respeito e cordialidade**
**1.2** - Proibido **discriminação** por raça, religião, gênero ou orientação sexual
**1.3** - Mantenha um **vocabulário adequado e civilizado**
**1.4** - Não faça **spam, flood** ou mensagens excessivas
**1.5** - Proibido compartilhar conteúdo **ofensivo, NSFW ou ilegal**
**1.6** - **Respeite as opiniões diferentes**, mesmo que discorde
**1.7** - Evite discussões **políticas ou religiosas** polêmicas
**1.8** - Use **bom senso** em todas as suas interações
`;

            // Parte 3: Comunidade Digital
            const part3 = `

## 💬 2. REGRAS DA COMUNIDADE DIGITAL

**2.1** - Use os **canais apropriados** para cada tipo de conversa
**2.2** - No **Discord**: respeite as categorias e canais específicos
**2.3** - Nos **grupos de WhatsApp**: mantenha o foco no assunto do grupo
**2.4** - Proibido **divulgação** de outros servidores/comunidades sem autorização
**2.5** - Não faça **menções desnecessárias** (@everyone, @here, @staff)
**2.6** - Evite **conversas paralelas** em canais públicos
**2.7** - Use **emojis e reações** com moderação
**2.8** - Mantenha seu **nickname apropriado** e identificável
`;

            // Parte 4: VIP e Redes Sociais
            const part4 = `


## 👑 3. REGRAS DO GRUPO VIP E BENEFÍCIOS

**3.1** - O acesso VIP é um **privilégio, não um direito**
**3.2** - Mantenha ainda mais **respeito e cordialidade** na área VIP
**3.3** - Não compartilhe **informações exclusivas** fora do grupo VIP
**3.4** - **Abuso dos benefícios** pode resultar em perda do status VIP
**3.5** - Seja um **exemplo positivo** para outros membros
**3.6** - **Ajude novos membros** quando possível
**3.7** - Respeite os **limites de uso** dos benefícios VIP
**3.8** - **Contribua construtivamente** para a comunidade



## 📱 4. REGRAS DE REDES SOCIAIS E REPRESENTAÇÃO

**4.1** - Ao representar a comunidade ASKAL, mantenha **postura adequada**
**4.2** - Não crie **drama ou polêmicas** envolvendo o nome ASKAL
**4.3** - Em **redes sociais**, seja respeitoso ao mencionar a comunidade
**4.4** - Não use a **tag ASKAL** para fins pessoais inadequados
**4.5** - Compartilhe **conteúdo positivo** sobre a comunidade
**4.6** - Evite **exposição negativa** da comunidade em outras plataformas
**4.7** - Colabore para manter a **boa reputação** da ASKAL
**4.8** - **Denuncie comportamentos inadequados** à administração
`;

            // Parte 5: Punições
            const part5 = `


## ⚖️ 5. SISTEMA DE PUNIÇÕES E MODERAÇÃO

**5.1** - **Advertência:** Primeira quebra de regra ou comportamento inadequado
**5.2** - **Silenciamento Temporário:** Spam, flood ou desrespeito
**5.3** - **Remoção de Benefícios:** Abuso de privilégios VIP
**5.4** - **Kick/Timeout:** Comportamento inadequado persistente
**5.5** - **Ban Temporário:** Quebras graves ou reincidência
**5.6** - **Ban Permanente:** Quebras muito graves ou múltiplas reincidências

### 📋 Processo de Recurso:
• Use o **sistema de tickets** para contestar punições
• Apresente **evidências** e sua versão dos fatos de forma respeitosa
• A **decisão final** sempre cabe à administração

### ⚠️ Observações importantes:
• Punições se aplicam a **TODOS os espaços** da comunidade
• Tentativas de **burlar punições** resultam em ban permanente
• A staff tem **autonomia** para aplicar punições adequadas à situação
`;

            // Parte 6: Conclusão
            const part6 = `


## ✅ CONCLUSÃO DAS REGRAS DA COMUNIDADE

### 🎉 Parabéns por chegar até o final!

Você acabou de ler todas as regras da **Comunidade DayZ ASKAL**. Estas regras garantem um ambiente saudável, respeitoso e divertido para todos os membros em **TODOS os nossos espaços**.

### 📝 Para se verificar e ter acesso completo:
• Certifique-se de que **compreendeu todas as regras**
• Clique no botão **"Li e aceito as regras"** (será adicionado pela staff)
• Aguarde receber o **cargo de verificado** automaticamente

### 🎮 Após a verificação você terá acesso a:
• **Todos os canais** da comunidade Discord
• **Grupos de WhatsApp** da comunidade
• **Informações sobre servidores** de DayZ
• **Sistema de tickets** para suporte
• **Eventos e atividades** exclusivas
• **Possibilidade de acesso VIP**

## 🏆 Bem-vindo à Comunidade DayZ ASKAL!
*Esperamos que você tenha experiências incríveis conosco!*

`;

            // Enviar as partes uma por uma com pequeno delay
            await targetChannel.send(part1);
            await new Promise(resolve => setTimeout(resolve, 500));

            await targetChannel.send(part2);
            await new Promise(resolve => setTimeout(resolve, 500));

            await targetChannel.send(part3);
            await new Promise(resolve => setTimeout(resolve, 500));

            await targetChannel.send(part4);
            await new Promise(resolve => setTimeout(resolve, 500));

            await targetChannel.send(part5);
            await new Promise(resolve => setTimeout(resolve, 500));

            await targetChannel.send(part6);

            await interaction.reply({
                content: `✅ **Regras da Comunidade ASKAL criadas em formato Markdown em ${targetChannel}!**\n\n` +
                    `📝 **Vantagens do formato Markdown:**\n` +
                    `• ✨ Texto mais amplo e legível\n` +
                    `• 🎨 Formatação rica com negrito e títulos\n` +
                    `• 📖 Melhor experiência de leitura\n` +
                    `• 🔄 Dividido em 6 partes para melhor organização\n\n` +
                    `**Próximos passos:**\n` +
                    `1. Use \`/verificacao regras\` no canal para adicionar o botão\n` +
                    `2. Teste o sistema de verificação\n` +
                    `3. Verifique se tudo funciona corretamente\n\n` +
                    `🗑️ **Para limpar:** Delete as mensagens quando terminar os testes`,
                ephemeral: true
            }); console.log(`✅ Regras da Comunidade ASKAL (Markdown) criadas em ${targetChannel.name} por ${interaction.user.tag}`);

        } catch (error) {
            console.error('Erro ao criar regras markdown:', error);
            await interaction.reply({
                content: '❌ Erro ao criar as regras markdown. Verifique as permissões do bot no canal.',
                ephemeral: true
            });
        }
    },
};
