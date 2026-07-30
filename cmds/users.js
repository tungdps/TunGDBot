const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Search player info in GDPS')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Account username')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('username');
        await interaction.reply({ content: `👤 Searching user info for: **${username}**` });
    }
};
