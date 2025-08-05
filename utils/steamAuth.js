const { createHash, randomBytes } = require('crypto');
const axios = require('axios');

class SteamAuth {
    constructor() {
        this.realm = process.env.STEAM_REALM || 'http://localhost:3000';
        this.returnUrl = `${this.realm}/auth/steam/return`;
        this.apiKey = process.env.STEAM_API_KEY || 'SUA_STEAM_API_KEY_AQUI';

        // URLs da Steam
        this.steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
        this.steamApiUrl = 'https://api.steampowered.com';

        // Armazenamento temporário de sessões (em produção, use Redis ou banco de dados)
        this.sessions = new Map();
    }

    // Gerar URL de autenticação Steam
    generateAuthUrl(discordUserId) {
        const sessionId = this.generateSessionId();

        // Armazenar sessão temporária
        this.sessions.set(sessionId, {
            discordUserId,
            createdAt: Date.now(),
            status: 'pending'
        });

        const params = new URLSearchParams({
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': `${this.returnUrl}?session=${sessionId}`,
            'openid.realm': this.realm,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        });

        return `${this.steamOpenIdUrl}?${params.toString()}`;
    }

    // Gerar ID de sessão único
    generateSessionId() {
        return randomBytes(32).toString('hex');
    }

    // Extrair Steam ID da URL de retorno
    extractSteamId(identity) {
        const match = identity.match(/\/id\/(\d+)$/);
        return match ? match[1] : null;
    }

    // Verificar resposta da Steam
    async verifyResponse(query) {
        try {
            const verifyParams = new URLSearchParams(query);
            verifyParams.set('openid.mode', 'check_authentication');

            const response = await axios.post(this.steamOpenIdUrl, verifyParams.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data.includes('is_valid:true');
        } catch (error) {
            console.error('Erro ao verificar resposta Steam:', error);
            return false;
        }
    }

    // Buscar informações do usuário Steam
    async getUserInfo(steamId) {
        try {
            const url = `${this.steamApiUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`;
            const response = await axios.get(url);

            if (response.data && response.data.response && response.data.response.players.length > 0) {
                return response.data.response.players[0];
            }

            return null;
        } catch (error) {
            console.error('Erro ao buscar informações Steam:', error);
            return null;
        }
    }

    // Processar retorno da autenticação
    async processReturn(query) {
        try {
            const sessionId = query.session;
            const session = this.sessions.get(sessionId);

            if (!session) {
                return { success: false, error: 'Sessão inválida ou expirada' };
            }

            // Verificar se a sessão não expirou (15 minutos)
            if (Date.now() - session.createdAt > 15 * 60 * 1000) {
                this.sessions.delete(sessionId);
                return { success: false, error: 'Sessão expirada' };
            }

            // Verificar resposta da Steam
            const isValid = await this.verifyResponse(query);
            if (!isValid) {
                return { success: false, error: 'Resposta Steam inválida' };
            }

            // Extrair Steam ID
            const steamId = this.extractSteamId(query['openid.identity']);
            if (!steamId) {
                return { success: false, error: 'Steam ID não encontrado' };
            }

            // Buscar informações do usuário
            const userInfo = await this.getUserInfo(steamId);
            if (!userInfo) {
                return { success: false, error: 'Não foi possível obter informações do usuário' };
            }

            // Limpar sessão
            this.sessions.delete(sessionId);

            return {
                success: true,
                discordUserId: session.discordUserId,
                steamId,
                userInfo
            };

        } catch (error) {
            console.error('Erro ao processar retorno Steam:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }

    // Limpar sessões expiradas (executar periodicamente)
    cleanExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.createdAt > 15 * 60 * 1000) {
                this.sessions.delete(sessionId);
            }
        }
    }
}

module.exports = SteamAuth;
