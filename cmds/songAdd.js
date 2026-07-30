const { SlashCommandBuilder } = require('discord.js');
const fetch = require('request-promise');
const setup = require('../setup.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('songadd')
        .setDescription('Add SoundCloud song to GDPS')
        .addStringOption(option => 
            option.setName('url')
                .setDescription('SoundCloud Track URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const songUrl = interaction.options.getString('url');
        const host = setup.host || 'https://g6300.ps.fhgdps.com';

        try {
            const response = await fetch({
                uri: `${host}/tools/bot/songAdd.php`,
                method: 'POST',
                form: { url: songUrl, secret: 'WmVkYW1hc3RlcnM=' }
            });

            await interaction.editReply({ 
                content: `✅ **GDPS Response:**\n\`\`\`${response}\`\`\`` 
            });
        } catch (error) {
            await interaction.editReply({ content: `❌ Failed to add song to GDPS!` });
        }
    }
};
