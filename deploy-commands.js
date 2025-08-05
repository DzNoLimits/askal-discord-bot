const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];

// Carregar todos os comandos
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`⚠️ O comando em ${filePath} está faltando "data" ou "execute".`);
        }
    }
}

// Instanciar e configurar o módulo REST
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Função para registrar comandos
async function deployCommands() {
    try {
        console.log(`🔄 Iniciando refresh de ${commands.length} comandos slash.`);

        // Registrar comandos globalmente (demora até 1 hora para aparecer)
        // Para teste, use comandos de guild (instantâneo)
        let data;
        
        if (process.env.GUILD_ID) {
            // Comandos de guild (para desenvolvimento/teste)
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} comandos registrados no servidor de teste.`);
        } else {
            // Comandos globais (para produção)
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} comandos registrados globalmente.`);
        }

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    deployCommands();
}

module.exports = { deployCommands };
