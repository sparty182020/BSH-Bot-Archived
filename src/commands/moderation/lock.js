const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option => option.setName('reason').setDescription('The lock reason').setRequired(false)),
    info: {
        description: 'Lock a channel and stop members from using it',
        usage: '/lock [reason]',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const channel = interaction.channel

        if (interaction.member.roles.cache.has('999313227722793090')) {
            await interaction.reply({
                content: `You can't lock this channel!`,
                ephemeral: true
            })
            return;
        }
        
        const reason = interaction.options.getString('reason') || null;

        await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });

        if (reason != null) {
            const embed = client.embed()
                .setTitle('Channel Locked')
                .setDescription(reason)
                .setTimestamp(Date.now())

            client.sql.createModLogs("lock", reason, interaction.member.id, interaction.channel.id);
            await channel.send({ embeds: [embed] });
        } else {
            client.sql.createModLogs("lock", null, interaction.member.id, interaction.channel.id);
        }

        await interaction.reply({
            content: `${require('../../settings/emojis.json').badges.green} Locked ${channel}!`,
            ephemeral: true
        })
    },
};