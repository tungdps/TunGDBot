const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('request-promise');
let setup = {};

try {
    setup = require('../setup.json');
} catch (e) {
    setup = {};
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Get song info from GDPS')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('Song ID in GDPS')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const songId = interaction.options.getInteger('id');
        
        // Tự động kiểm tra và xử lý đường dẫn host gốc
        let baseUrl = process.env.GDPS_URL || setup.host || 'https://g6300.ps.fhgdps.com';
        baseUrl = baseUrl.replace(/\/+$/, ''); // Bỏ dấu / thừa ở cuối nếu có
        
        if (!baseUrl.endsWith('/database')) {
            baseUrl += '/database';
        }

        try {
            const response = await fetch({
                uri: `${baseUrl}/getGDSongs.php`,
                method: 'POST',
                form: { songID: songId, secret: 'WmVkYW1hc3RlcnM=' },
                headers: {
                    'User-Agent': 'GeometryDash/2.11'
                }
            });

            // Nếu server trả về -1 nghĩa là bài hát chưa tồn tại trên GDPS
            if (!response || response === '-1' || response.includes('404 Not Found')) {
                return await interaction.editReply({ 
                    content: `❌ Song ID **${songId}** không tồn tại trên GDPS!` 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎵 Song Info - ID: ${songId}`)
                .setDescription(`\`\`\`${response.substring(0, 300)}\`\`\``)
                .setColor('#00ffcc');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `❌ Lỗi kết nối GDPS (404/Server Error): Hãy kiểm tra lại đường dẫn database!` 
            });
        }
    }
};
