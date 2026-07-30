const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('request-promise');
const setup = require('../setup.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Get song info from GDPS')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('Song ID')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const songId = interaction.options.getInteger('id');
        const host = setup.host || 'https://g6300.ps.fhgdps.com';

        try {
            const response = await fetch({
                uri: `${host}/getGDSongs.php`,
                method: 'POST',
                form: { songID: songId, secret: 'WmVkYW1hc3RlcnM=' }
            });

            if (!response || response === '-1' || response.includes('Error')) {
                return await interaction.editReply({ content: `❌ Song ID **${songId}** not found on GDPS!` });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🎵 Song Info - ID: ${songId}`)
                .setDescription(`\`\`\`${response.substring(0, 300)}\`\`\``)
                .setColor('#00ffcc');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: `❌ Error connecting to GDPS: ${error.message}` });
        }
    }
};
