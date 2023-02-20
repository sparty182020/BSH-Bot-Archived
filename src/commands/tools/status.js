const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Get the status of the bot'),
    info: {
        description: 'Get the status of the bot',
        usage: '/status',
        type: 'tools'
    },
    async execute(interaction, client) {
        const status = {
            ping: {
                value: client.ws.ping,
                icon: require('../../settings/emojis.json').badges.green,
            },
            uptime: client.getUptime(),
            guilds: client.guilds.cache.size,
            statuspage: 'STATUSPAGE_URL'
        }

        if (status.ping.value > 100) status.ping.icon = require('../../settings/emojis.json').badges.orange;
        if (status.ping.value > 200) status.ping.icon = require('../../settings/emojis.json').badges.yellow;
        if (status.ping.value > 300) status.ping.icon = require('../../settings/emojis.json').badges.red;
        const embed = client.embed()
            .setTitle('Bot Status')
            .setTimestamp()
            .setFields([
                {
                    name: 'Ping',
                    value: `${status.ping.icon} ${status.ping.value}ms`,
                },
                {
                    name: 'Uptime',
                    value: status.uptime,
                },
                {
                    name: 'Servers',
                    value: status.guilds.toString(),
                },
                {
                    name: 'Statuspage',
                    value: `[BetterUptime Statuspage](${status.statuspage})`,
                }
            ])

        await interaction.reply({ embeds: [embed] });
    }
}