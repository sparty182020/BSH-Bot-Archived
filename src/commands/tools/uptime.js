const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Get the uptime of the bot'),
    info: {
        description: 'Get the uptime of the bot',
        usage: '/uptime',
        type: 'tools'
    },
    async execute(interaction, client) {
        timeString = client.getUptime()
        const embed = client.embed()
            .setTitle('Uptime')
            .setDescription(`I've been online for ${timeString}.`)
            .setTimestamp()
        await interaction.reply({ embeds: [embed] })
    }
}