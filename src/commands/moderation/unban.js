const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The unban reason').setRequired(true)),
    info: {
        description: 'Unban a member from the server',
        usage: '/unban <member> <reason>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('member');
        const staff = interaction.member;
        const reason = interaction.options.getString('reason');

        if (member.id === staff.id) return interaction.reply({ content: ':x: You cannot unban yourself', ephemeral: true });

        client.sql.createModLogs("unban", reason, staff.id, interaction.channel.id);

        const staffEmbed = new EmbedBuilder()
            .setFields([
                {
                    name: `${require('../../settings/emojis.json').badges.green} ${member.tag} unbanned`,
                    value: `> **Reason**: ${reason}`
                }
            ])
            .setColor(client.color)

        await interaction.reply({
            embeds: [staffEmbed],
        })
        
        await interaction.guild.members.unban(member.id, reason)

        const logEmbed = new EmbedBuilder()
            .setTitle(`Unban`)
            .setDescription(`> **Member:** ${member.tag} (${member.id})\n> **Reason:** ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
            .setFooter({
                text: `${interaction.user.tag} | ${client.footer.text}`,
                iconURL: interaction.member.displayAvatarURL()
            })
            .setThumbnail(member.displayAvatarURL());
        
        const channel = client.channels.cache.get('1008315793806737509');
        await channel.send({ embeds: [logEmbed] })
    },
};