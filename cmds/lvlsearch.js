const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('request-promise');
const setup = require('../setup.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lvlsearch')
        .setDescription('Search level on GDPS')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Level Name or ID')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const host = setup.host || 'https://g6300.ps.fhgdps.com';

        try {
            const response = await fetch({
                uri: `${host}/getGJLevels21.php`,
                method: 'POST',
                form: { str: query, secret: 'WmVkYW1hc3RlcnM=' }
            });

            if (!response || response === '-1') {
                return await interaction.editReply({ content: `❌ Level **${query}** not found on GDPS!` });
            }

            const embed = new EmbedBuilder()
                .setTitle(`🔍 Search Result for: ${query}`)
                .setDescription(`\`\`\`${response.substring(0, 300)}\`\`\``)
                .setColor('#ffaa00');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: `❌ Error searching level!` });
        }
    }
};
