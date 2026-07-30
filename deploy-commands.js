const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 1. Đọc TOKEN và CLIENT_ID từ Environment Variables (Railway) hoặc file config.json
let token, clientId;

try {
    const config = require('./config.json');
    token = process.env.TOKEN || process.env.BOT_TOKEN || config.token;
    clientId = process.env.CLIENT_ID || process.env.CLIENTID || process.env.APP_ID || config.clientId || config.clientID;
} catch (e) {
    token = process.env.TOKEN || process.env.BOT_TOKEN;
    clientId = process.env.CLIENT_ID || process.env.CLIENTID || process.env.APP_ID;
}

// 2. Kiểm tra nếu chưa cấu hình biến môi trường
if (!token || !clientId) {
    console.error('\n❌ LỖI CRITICAL: Thiếu TOKEN hoặc CLIENT_ID!');
    console.error('👉 Vui lòng thêm TOKEN và CLIENT_ID vào tab Variables trên Railway.\n');
    process.exit(1);
}

// 3. Quét toàn bộ lệnh Slash trong thư mục cmds
const commands = [];
const commandsPath = path.join(__dirname, 'cmds');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') && file !== 'deploy-commands.js'
    );

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            
            // Kiểm tra cấu trúc lệnh Slash chuẩn discord.js v14
            if (command && 'data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`[+] Đã load cấu hình lệnh Slash: ${file}`);
            } else {
                console.log(`[-] Bỏ qua ${file}: Thiếu cấu trúc SlashCommandBuilder (data/execute).`);
            }
        } catch (err) {
            console.error(`[!] Không thể nạp file ${file}:`, err.message);
        }
    }
} else {
    console.error('❌ LỖI: Không tìm thấy thư mục /cmds!');
    process.exit(1);
}

// 4. Khởi tạo REST module để đăng ký lệnh với Discord API
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`\n🚀 Đang đăng ký ${commands.length} lệnh Slash (/) lên Discord API...`);

        // Đăng ký Slash Command Toàn Cầu (Global Commands)
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ THÀNH CÔNG! Đã cập nhật ${data.length} lệnh Slash (/) lên Discord.\n`);
    } catch (error) {
        console.error('❌ Lỗi xảy ra khi đăng ký lệnh lên Discord API:', error);
    }
})();
