const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shut')
        .setDescription('Shutdown the bot (Admin only)'),

    async execute(interaction) {
        await interaction.reply({ content: '🛑 Shutting down TunGDBot...' });
        process.exit(1);
    }
};
