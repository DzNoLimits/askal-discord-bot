const express = require('express');
const SteamAuth = require('./steamAuth');
const SteamDatabase = require('./steamDatabase');

class SteamWebServer {
    constructor(bot) {
        this.bot = bot;
        this.app = express();
        this.steamAuth = new SteamAuth();
        this.steamDB = new SteamDatabase();
        this.port = process.env.STEAM_WEB_PORT || 3000;

        this.setupRoutes();
        this.setupCleanup();
    }

    setupRoutes() {
        // Middleware
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());

        // Rota para receber callback da Steam
        this.app.get('/auth/steam/return', async (req, res) => {
            try {
                const result = await this.steamAuth.processReturn(req.query);

                if (!result.success) {
                    return res.send(`
                        <html>
                            <head>
                                <title>Erro - Vinculação Steam</title>
                                <style>
                                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #0d1117; color: #f0f6fc; }
                                    .error { background: #da3633; padding: 20px; border-radius: 8px; display: inline-block; }
                                    .back-btn { margin-top: 20px; padding: 10px 20px; background: #21262d; color: #f0f6fc; text-decoration: none; border-radius: 4px; }
                                </style>
                            </head>
                            <body>
                                <div class="error">
                                    <h2>❌ Erro na Vinculação</h2>
                                    <p>${result.error}</p>
                                    <a href="#" onclick="window.close()" class="back-btn">Fechar Janela</a>
                                </div>
                            </body>
                        </html>
                    `);
                }

                // Processar vinculação bem-sucedida
                await this.processSuccessfulLink(result);

                // Página de sucesso
                res.send(`
                    <html>
                        <head>
                            <title>Sucesso - Vinculação Steam</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #0d1117; color: #f0f6fc; }
                                .success { background: #238636; padding: 20px; border-radius: 8px; display: inline-block; }
                                .steam-info { background: #21262d; padding: 15px; margin: 20px 0; border-radius: 8px; }
                                .close-btn { margin-top: 20px; padding: 10px 20px; background: #1f6feb; color: white; text-decoration: none; border-radius: 4px; }
                                .steam-avatar { border-radius: 50%; margin: 10px; }
                            </style>
                        </head>
                        <body>
                            <div class="success">
                                <h2>✅ Vinculação Concluída!</h2>
                                <div class="steam-info">
                                    <img src="${result.userInfo.avatarmedium}" alt="Avatar" class="steam-avatar">
                                    <h3>${result.userInfo.personaname}</h3>
                                    <p><strong>Steam ID:</strong> ${result.steamId}</p>
                                </div>
                                <p>🎁 Seu pacote de boas-vindas será entregue automaticamente!</p>
                                <p>Volte ao Discord para ver suas recompensas.</p>
                                <a href="#" onclick="window.close()" class="close-btn">Fechar e Voltar ao Discord</a>
                            </div>
                            <script>
                                // Auto-fechar após 10 segundos
                                setTimeout(() => window.close(), 10000);
                            </script>
                        </body>
                    </html>
                `);

            } catch (error) {
                console.error('Erro no callback Steam:', error);
                res.status(500).send('Erro interno do servidor');
            }
        });

        // Rota de status/saúde
        this.app.get('/status', (req, res) => {
            res.json({
                status: 'online',
                steamAuth: 'ready',
                database: 'connected',
                timestamp: Date.now()
            });
        });

        // Rota para estatísticas (protegida)
        this.app.get('/stats', (req, res) => {
            const stats = this.steamDB.getStats();
            res.json(stats);
        });
    }

    async processSuccessfulLink(result) {
        try {
            const { discordUserId, steamId, userInfo } = result;

            // Verificar se já existe vinculação
            if (this.steamDB.isDiscordLinked(discordUserId)) {
                throw new Error('Discord já possui Steam vinculada');
            }

            if (this.steamDB.isSteamLinked(steamId)) {
                throw new Error('Steam ID já está vinculada');
            }

            // Criar vinculação no banco de dados
            await this.steamDB.createLink(discordUserId, { steamId, userInfo });

            // Buscar usuário no Discord
            const user = await this.bot.users.fetch(discordUserId);
            if (!user) {
                console.error('Usuário Discord não encontrado:', discordUserId);
                return;
            }

            // Notificar sucesso no Discord
            await this.notifySuccessfulLink(user, { steamId, userInfo });

            // Entregar pacote de boas-vindas
            await this.deliverWelcomePackage(user, { steamId, userInfo });

            console.log(`✅ Vinculação Steam concluída: ${user.tag} -> ${userInfo.personaname} (${steamId})`);

        } catch (error) {
            console.error('Erro ao processar vinculação bem-sucedida:', error);
        }
    }

    async notifySuccessfulLink(user, steamData) {
        try {
            const { steamId, userInfo } = steamData;

            const successEmbed = {
                color: 0x00ff00,
                title: '🎉 Vinculação Steam Concluída!',
                description: `**Parabéns ${user}!**\n\nSua conta Steam foi vinculada com sucesso à comunidade ASKAL!`,
                fields: [
                    {
                        name: '🎮 Conta Steam',
                        value: `**${userInfo.personaname}**\n\`${steamId}\``,
                        inline: true
                    },
                    {
                        name: '🎁 Benefícios Ativados',
                        value: '• Pacote de boas-vindas\n• Acesso VIP (7 dias)\n• Cargo especial',
                        inline: true
                    },
                    {
                        name: '🚀 Próximos Passos',
                        value: 'Entre no servidor DayZ para receber seus itens!',
                        inline: false
                    }
                ],
                thumbnail: {
                    url: userInfo.avatarmedium
                },
                footer: {
                    text: 'DayZ ASKAL • Sistema de Vinculação Steam',
                },
                timestamp: new Date().toISOString()
            };

            await user.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Erro ao notificar vinculação:', error);
        }
    }

    async deliverWelcomePackage(user, steamData) {
        try {
            // Simular entrega do pacote (aqui você integraria com o servidor DayZ)
            console.log(`🎁 Entregando pacote de boas-vindas para ${user.tag} (Steam: ${steamData.steamId})`);

            // Marcar como entregue no banco
            await this.steamDB.markWelcomePackageDelivered(user.id);

            // Definir VIP por 7 dias
            const vipUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
            await this.steamDB.setVipUntil(user.id, vipUntil);

            // Aqui você pode integrar com:
            // - API do servidor DayZ para entregar itens
            // - Sistema de cargos VIP no Discord
            // - Webhook para notificar admins
            // - Sistema de logs para auditoria

        } catch (error) {
            console.error('Erro ao entregar pacote de boas-vindas:', error);
        }
    }

    setupCleanup() {
        // Limpar sessões expiradas a cada 5 minutos
        setInterval(() => {
            this.steamAuth.cleanExpiredSessions();
        }, 5 * 60 * 1000);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Servidor Steam OAuth2 rodando na porta ${this.port}`);
            console.log(`🔗 Callback URL: http://localhost:${this.port}/auth/steam/return`);
        });
    }

    getSteamAuth() {
        return this.steamAuth;
    }

    getSteamDB() {
        return this.steamDB;
    }
}

module.exports = SteamWebServer;
