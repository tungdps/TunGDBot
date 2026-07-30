const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();

// Load tất cả các lệnh Slash từ thư mục cmds
const commandsPath = path.join(__dirname, 'cmds');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'deploy-commands.js');

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if (command && 'data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            }
        } catch (e) {
            console.error(`Lỗi nạp file ${file}:`, e);
        }
    }
}

client.once('ready', () => {
    console.log(`✅ Bot đã online: ${client.user.tag}`);
});

// LẮNG NGHE LỆNH SLASH (Bắt buộc phải có đoạn này)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Lỗi khi chạy lệnh:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Có lỗi xảy ra khi thực hiện lệnh!', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi thực hiện lệnh!', ephemeral: true });
        }
    }
});

// Đăng nhập Bot
const token = process.env.TOKEN || process.env.BOT_TOKEN;
client.login(token);
