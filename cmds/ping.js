const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Khai báo tên và mô tả lệnh Slash (Discord bắt buộc viết chữ thường, không khoảng trắng)
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Kiểm tra độ phản hồi của Bot TunGD'),

    // Hàm thực thi khi người dùng gõ /ping
    async execute(interaction) {
        const ping = interaction.client.ws.ping;
        await interaction.reply({ content: `🏓 Pong! Độ trễ hiện tại là **${ping}ms**` });
    },
};
