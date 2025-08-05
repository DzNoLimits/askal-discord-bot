const fs = require('fs').promises;
const path = require('path');

class SteamDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'steam-links.json');
        this.data = {
            links: {},      // discordId -> steamData
            steamIds: {}    // steamId -> discordId (para verificar duplicatas)
        };
        this.loadData();
    }

    // Carregar dados do arquivo
    async loadData() {
        try {
            // Criar diretório se não existir
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

            // Tentar carregar arquivo existente
            const fileContent = await fs.readFile(this.dbPath, 'utf8');
            this.data = JSON.parse(fileContent);
        } catch (error) {
            // Se arquivo não existe, criar com dados vazios
            console.log('Criando novo banco de dados Steam...');
            await this.saveData();
        }
    }

    // Salvar dados no arquivo
    async saveData() {
        try {
            await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Erro ao salvar banco de dados Steam:', error);
        }
    }

    // Verificar se Discord já tem Steam vinculada
    isDiscordLinked(discordId) {
        return !!this.data.links[discordId];
    }

    // Verificar se Steam ID já está vinculada
    isSteamLinked(steamId) {
        return !!this.data.steamIds[steamId];
    }

    // Obter vinculação por Discord ID
    getLinkByDiscord(discordId) {
        return this.data.links[discordId] || null;
    }

    // Obter Discord ID por Steam ID
    getDiscordBySteam(steamId) {
        return this.data.steamIds[steamId] || null;
    }

    // Criar nova vinculação
    async createLink(discordId, steamData) {
        const { steamId, userInfo } = steamData;

        // Verificar se já existem vinculações
        if (this.isDiscordLinked(discordId)) {
            throw new Error('Discord já possui Steam vinculada');
        }

        if (this.isSteamLinked(steamId)) {
            throw new Error('Steam ID já está vinculada a outro Discord');
        }

        // Criar vinculação
        const linkData = {
            steamId,
            userInfo,
            linkedAt: Date.now(),
            lastUpdate: Date.now(),
            welcomePackageDelivered: false,
            vipUntil: null,
            stats: {
                logins: 0,
                lastLogin: null,
                totalPlaytime: 0
            }
        };

        this.data.links[discordId] = linkData;
        this.data.steamIds[steamId] = discordId;

        await this.saveData();
        return linkData;
    }

    // Remover vinculação
    async removeLink(discordId) {
        const link = this.data.links[discordId];
        if (!link) {
            return false;
        }

        delete this.data.steamIds[link.steamId];
        delete this.data.links[discordId];

        await this.saveData();
        return true;
    }

    // Atualizar informações da vinculação
    async updateLink(discordId, updates) {
        const link = this.data.links[discordId];
        if (!link) {
            return false;
        }

        Object.assign(link, updates, { lastUpdate: Date.now() });
        await this.saveData();
        return true;
    }

    // Marcar pacote de boas-vindas como entregue
    async markWelcomePackageDelivered(discordId) {
        return await this.updateLink(discordId, { welcomePackageDelivered: true });
    }

    // Definir período VIP
    async setVipUntil(discordId, timestamp) {
        return await this.updateLink(discordId, { vipUntil: timestamp });
    }

    // Registrar login no servidor
    async recordLogin(discordId) {
        const link = this.data.links[discordId];
        if (!link) {
            return false;
        }

        link.stats.logins++;
        link.stats.lastLogin = Date.now();

        await this.saveData();
        return true;
    }

    // Obter estatísticas gerais
    getStats() {
        const totalLinks = Object.keys(this.data.links).length;
        const totalSteamIds = Object.keys(this.data.steamIds).length;
        const welcomePackagesDelivered = Object.values(this.data.links)
            .filter(link => link.welcomePackageDelivered).length;

        const activeVips = Object.values(this.data.links)
            .filter(link => link.vipUntil && link.vipUntil > Date.now()).length;

        return {
            totalLinks,
            totalSteamIds,
            welcomePackagesDelivered,
            activeVips,
            lastUpdate: Math.max(...Object.values(this.data.links).map(l => l.lastUpdate || 0))
        };
    }

    // Listar todas as vinculações
    getAllLinks() {
        return this.data.links;
    }

    // Buscar vinculações por critério
    searchLinks(criteria) {
        return Object.entries(this.data.links)
            .filter(([discordId, link]) => {
                if (criteria.steamId && link.steamId !== criteria.steamId) return false;
                if (criteria.discordId && discordId !== criteria.discordId) return false;
                if (criteria.hasWelcomePackage !== undefined &&
                    link.welcomePackageDelivered !== criteria.hasWelcomePackage) return false;
                if (criteria.hasVip !== undefined) {
                    const hasVip = link.vipUntil && link.vipUntil > Date.now();
                    if (hasVip !== criteria.hasVip) return false;
                }
                return true;
            })
            .map(([discordId, link]) => ({ discordId, ...link }));
    }
}

module.exports = SteamDatabase;
