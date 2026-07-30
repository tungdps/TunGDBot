const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('songadd')
        .setDescription('Insert a song from SoundCloud into GDPS')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('SoundCloud Song URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        await interaction.reply({ content: `➕ Adding song from: ${url}` });
    }
};
