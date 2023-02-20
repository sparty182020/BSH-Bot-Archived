const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        // channel to log to
        const logChannel = client.channels.cache.get('JOIN_LOG_CHANNEL_ID');

        // check if the member is partial
        if (member.partial) {
            // if partial, fetch the member
            member.fetch()
                .then(memberStats => {
                    // logging embed
                    const leaveLogEmbed = new EmbedBuilder()
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor(0xff0000)
                    .setFooter(client.footer)
                    .setFields([
                        {
                            name: 'User Left',
                            value: [
                                `> **User:** ${memberStats.user.tag} (<@${memberStats.id}>)`,
                                `> **ID:** \`${memberStats.id}\``,
                                `> **Joined:** <t:${Math.floor(new Date(memberStats.joinedAt) / 1000)}:f>`,
                                `> **Members:** ${memberStats.guild.memberCount}`
                            ].join('\n')
                        }
                    ])

                    logChannel.send({ embeds: [leaveLogEmbed] })
                }).catch(err => {
                    console.log("Failed to fetch member")
                })
        } else {
            // if not partial
            // logging embed
            const leaveLogEmbed = new EmbedBuilder()
                .setThumbnail(member.user.displayAvatarURL())
                .setColor(0xff0000)
                .setFooter(client.footer)
                .setFields([
                    {
                        name: 'User Left',
                        value: [
                            `> **User:** ${member.user.tag} (<@${member.id}>)`,
                            `> **ID:** \`${member.id}\``,
                            `> **Joined:** <t:${Math.floor(new Date(member.joinedAt) / 1000)}:f>`,
                            `> **Members:** ${member.guild.memberCount}`
                        ].join('\n')
                    }
                ])

            logChannel.send({ embeds: [leaveLogEmbed] })
        }
    }
}