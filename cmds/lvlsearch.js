const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lvlsearch')
        .setDescription('Search level in GDPS')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Level Name or ID')
                .setRequired(true)
        ),

    async execute(interaction) {
        const query = interaction.options.getString('query');
        await interaction.reply({ content: `🔍 Searching level: **${query}**` });
    }
};
