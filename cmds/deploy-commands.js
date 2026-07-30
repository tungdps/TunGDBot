const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Đọc Token và Client ID từ Environment Variables (Biến môi trường) hoặc config.json
const token = process.env.TOKEN || require('./config.json').token;
const clientId = process.env.CLIENT_ID || require('./config.json').clientId;

const commands = [];
const commandsPath = path.join(__dirname, 'cmds');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Đang đẩy ${commands.length} lệnh Slash (/) lên Discord...`);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ Đã đăng ký thành công tất cả lệnh Slash (/)!');
    } catch (error) {
        console.error('❌ Lỗi khi đăng ký lệnh:', error);
    }
})();
