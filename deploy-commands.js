const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Đọc Token và Client ID từ Railway Environment Variables hoặc config.json (nếu có)
let token, clientId;

try {
    const config = require('./config.json');
    token = process.env.TOKEN || config.token;
    clientId = process.env.CLIENT_ID || config.clientId || config.clientID;
} catch (e) {
    // Nếu không có file config.json thì dùng biến môi trường của Railway
    token = process.env.TOKEN;
    clientId = process.env.CLIENT_ID;
}

if (!token || !clientId) {
    console.error('❌ LỖI: Thiếu TOKEN hoặc CLIENT_ID trong Environment Variables trên Railway!');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'cmds');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'deploy-commands.js');

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🚀 Đang đăng ký ${commands.length} lệnh Slash (/) lên Discord...`);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ Đăng ký thành công toàn bộ lệnh Slash (/)!');
    } catch (error) {
        console.error('❌ Lỗi khi đăng ký lệnh Slash:', error);
    }
})();
