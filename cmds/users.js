const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('request-promise');
const setup = require('../setup.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('users')
        .setDescription('Search player info on GDPS')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('GDPS Username')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const username = interaction.options.getString('username');
        const host = setup.host || 'https://g6300.ps.fhgdps.com';

        try {
            const response = await fetch({
                uri: `${host}/getGDUsers.php`,
                method: 'POST',
                form: { str: username, secret: 'WmVkYW1hc3RlcnM=' }
            });

            if (!response || response === '-1') {
                return await interaction.editReply({ content: `❌ User **${username}** not found on GDPS!` });
            }

            const embed = new EmbedBuilder()
                .setTitle(`👤 Player Profile: ${username}`)
                .setDescription(`\`\`\`${response.substring(0, 300)}\`\`\``)
                .setColor('#0099ff');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({ content: `❌ Error fetching user info!` });
        }
    }
};
