const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const SteamWebServer = require('./utils/steamWebServer');
require('dotenv').config();

// Criar uma nova instância do cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Criar uma coleção para armazenar comandos
client.commands = new Collection();

// Carregar comandos
const foldersPath = path.join(__dirname, 'commands');
if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Comando carregado: ${command.data.name}`);
            } else {
                console.log(`⚠️ O comando em ${filePath} está faltando "data" ou "execute".`);
            }
        }
    }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ Evento carregado: ${event.name}`);
    }
}

// Login do bot
client.login(process.env.DISCORD_TOKEN);

// Inicializar servidor Steam OAuth2
let steamServer = null;

client.once('ready', () => {
    // Iniciar servidor Steam após o bot estar pronto
    steamServer = new SteamWebServer(client);

    // Para Railway: usar porta do ambiente ou 3000
    const PORT = process.env.PORT || process.env.STEAM_WEB_PORT || 3000;
    steamServer.start(PORT);

    // Disponibilizar instâncias globalmente para uso nos comandos
    client.steamAuth = steamServer.getSteamAuth();
    client.steamDB = steamServer.getSteamDB();

    console.log('🎮 Sistema Steam OAuth2 inicializado!');
    console.log(`🌐 Servidor Steam rodando na porta ${PORT}`);

    // Para Railway: log da URL pública
    if (process.env.RAILWAY_STATIC_URL) {
        console.log(`🔗 URL pública: ${process.env.RAILWAY_STATIC_URL}`);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🔄 Encerrando bot e servidor Steam...');
    if (steamServer) {
        steamServer.stop();
    }
    client.destroy();
    process.exit(0);
});
