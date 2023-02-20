const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option => option.setName('reason').setDescription('The reason for unlock').setRequired(false)),
    info: {
        description: 'Unlock a channel and allow members to use it again',
        usage: '/unlock [reason]',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const channel = interaction.channel

        if (interaction.member.roles.cache.has('999313227722793090')) {
            await interaction.reply({
                content: `You can't unlock this channel!`,
                ephemeral: true
            })
            return;
        }
        const reason = interaction.options.getString('reason') || null;

        await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });

        if (reason != null) {
            const embed = new EmbedBuilder()
                .setTitle('Channel Unlocked')
                .setDescription(reason)
                .setColor(client.color)
                .setTimestamp(Date.now())
                .setFooter({
                    iconURL: interaction.user.displayAvatarURL(),
                    text: `${interaction.user.tag} | ${client.footer.text}`
                })

            client.sql.createModLogs("unlock", reason, interaction.member.id, interaction.channel.id);
            await channel.send({ embeds: [embed] });
        } else {
            client.sql.createModLogs("unlock", null, interaction.member.id, interaction.channel.id);
        }

        await interaction.reply({
            content: `${require('../../settings/emojis.json').badges.green} Unlocked ${channel}!`,
            ephemeral: true
        })
    },
};