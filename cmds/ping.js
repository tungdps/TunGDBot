const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    async execute(interaction) {
        // Lấy ping websocket chuẩn từ client
        const ping = interaction.client.ws.ping;
        
        // Trả lời lệnh Slash
        await interaction.reply({ 
            content: `Pong! My ping is **${ping}ms**` 
        });
    },
};
