const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode of the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('time').setDescription('The amount of time for slowmode').setMinValue(0).setRequired(false))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to set slowmode').setRequired(false)),
    info: {
        description: 'Set/Get the slowmode of the channel',
        usage: '/slowmode <time> <channel>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const time = interaction.options.getInteger('time');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (time != null) {
            if (!interaction.member.roles.cache.has('1004426132667498666')) {
                return await interaction.reply({
                    content: `You do not have permission to use this command!`,
                    ephemeral: true
                })
            }
            const embed = client.embed()
                .setTitle(`${require('../../settings/emojis.json').badges.green} Set slowmode to ${time} seconds`)
                .setDescription(`Channel: ${channel}`)

            await channel.setRateLimitPerUser(time)

            client.sql.createModLogs("slowmode", null, interaction.member.id, channel.id);
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = client.embed()
                .setDescription(`Slowmode is currently set to \`${channel.rateLimitPerUser}\` seconds\nIn channel <#${channel.id}>`)
    
            await interaction.reply({ embeds: [embed] });
        }
    },
};