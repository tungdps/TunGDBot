const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Restart the bot (Admin only)'),

    async execute(interaction) {
        await interaction.reply({ content: '🔄 Restarting TunGDBot...' });
        process.exit(0);
    }
};
