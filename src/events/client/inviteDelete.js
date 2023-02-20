module.exports = {
    name: 'inviteDelete',
    async execute(invite, client) {
        const logChannel = client.channels.cache.get("INVITE_LOG_CHANNEL_ID");

        const embed = client.embed()
            .setAuthor(invite.guild.name, invite.guild.iconURL({ dynamic: true }))
            .setTitle("Invite Deleted")
            .setDescription(`**Invite Code:** ${invite.code}`)
            .setTimestamp();

        if (invite.channel) embed.addFields({ name: "Channel", value: invite.channel.toString(), inline: true });
        if (invite.inviter) embed.addFields({ name: "Inviter", value: invite.inviter.tag, inline: true });

        await logChannel.send({ embeds: [embed] });
    }
}