const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelby')
        .setDescription('Get levels created by a player')
        .addStringOption(option => 
            option.setName('creator')
                .setDescription('Creator username')
                .setRequired(true)
        ),

    async execute(interaction) {
        const creator = interaction.options.getString('creator');
        await interaction.reply({ content: `📜 Levels created by: **${creator}**` });
    }
};
