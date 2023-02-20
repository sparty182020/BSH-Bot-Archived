const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Ping!'),
    info: {
        description: 'Play ping pong (or if you are an admin, it will show the bot\'s ping)',
        usage: '/ping',
        type: 'fun'
    },
    async execute(interaction, client) {
        if (!require('../../settings/developers.json').developers.includes(interaction.user.id)) return await interaction.reply('Pong <:ping_pong:1060413144633180160>');
        
        const ping = client.ws.ping;
        
        let icon = require('../../settings/emojis.json').badges.green;
        if (ping > 100) icon = require('../../settings/emojis.json').badges.orange;
        if (ping > 200) icon = require('../../settings/emojis.json').badges.yellow;
        if (ping > 300) icon = require('../../settings/emojis.json').badges.red;

        await interaction.reply({
            content: `${icon} **Ping:** ${ping}ms`
        });
    }
}