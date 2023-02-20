const { catchErrors } = require('../../functions/handlers/handleErrors');

module.exports = {
    name: 'inviteCreate',
    /**
     * 
     * @param {import('discord.js').Invite} invite 
     * @param {import('discord.js').Client} client 
     */
    async execute(invite, client) {
        try {
            await client.channels.fetch("INVITE_LOG_CHANNEL_ID")
                .then(async channel => {
                    const embed = client.embed()
                        .setAuthor(invite.guild.name, invite.guild.iconURL({ dynamic: true }))
                        .setTitle("Invite Created")
                        .setDescription(`**Invite Code:** ${invite.code}`)
                        .setTimestamp();

                    if (invite.channel) embed.addFields({ name: "Channel", value: invite.channel.toString(), inline: true });
                    if (invite.inviter) embed.addFields({ name: "Inviter", value: invite.inviter.tag, inline: true });
                    if (invite.maxAge) embed.addFields({ name: "Expires At", value: `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:F>`, inline: true });

                    await channel.send({ embeds: [embed] });
                })
        } catch (err) {
            catchErrors(err);
        }
    }
}