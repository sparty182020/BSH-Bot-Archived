const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the mute').setRequired(false)),
    info: {
        description: 'Unmute a member and allow them to speak',
        usage: '/unmute <user> <reason>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'No reason provided'

        if (member.id === interaction.user.id) return interaction.reply({ content: ':x: You cannot unmute yourself', ephemeral: true });

        await interaction.guild.members.cache.get(member.id).timeout(null)

        client.sql.createModLogs("unmute", reason, interaction.member.id, interaction.channel.id);

        const embed = new EmbedBuilder()
            .setTitle(`${require('../../settings/emojis.json').badges.green} Unmuted ${member.tag}`)
            .setDescription(`**Reason**: ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())

        const usrEmbed = new EmbedBuilder()
            .setTitle(`${require('../../settings/emojis.json').badges.green} You have been unmuted in ${interaction.guild.name}`)
            .setDescription(`**Reason**: ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
        
        await interaction.reply({ embeds: [embed] });
        await member.send({ embeds: [usrEmbed] })
            .catch(() => console.log(`Could not send unmute message to ${member.tag}`));

        const logEmbed = new EmbedBuilder()
            .setTitle(`Unmute`)
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