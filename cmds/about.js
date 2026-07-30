const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('request-promise');
const fs = require('fs');

// Đọc package.json để lấy phiên bản
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Check information about this bot'),

    async execute(interaction) {
        // Tạm hoãn phản hồi để có thời gian fetch dữ liệu từ GitHub
        await interaction.deferReply();

        try {
            const about = await fetch({
                uri: 'https://raw.githubusercontent.com/FamryAmri/Discord-Bot-GDPS/master/about',
                method: 'GET'
            });

            const embed = new EmbedBuilder()
                .setTitle('About this bot')
                .setDescription('```' + about + '```\n**Version**: ' + packageJson.version + ' | **Made by**: [Tunkoloithoat]( https://github.com/tungdps/TunGDBot/tree/master')
                .setColor('#0099ff');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Lỗi fetch thông tin about:', error);
            await interaction.editReply({ 
                content: '❌ Không thể tải thông tin giới thiệu từ GitHub!' 
            });
        }
    },
};
