const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Get info/download song by ID')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('The Song ID in GDPS')
                .setRequired(true)
        ),

    async execute(interaction) {
        const songId = interaction.options.getInteger('id');
        await interaction.reply({ content: `🎵 Song info for ID: **${songId}**` });
    }
};
