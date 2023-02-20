module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole, client) {
        const logChannel = await client.channels.cache.get("SERVER_LOG_CHANNEL_ID");

        const embed = client.embed()
            .setAuthor(newRole.guild.name, newRole.guild.iconURL({ dynamic: true }))
            .setTitle("Role Updated")
            .setDescription(`**Role Name:** ${newRole.name}`)
            .addFields(
                {
                    name: "Role ID",
                    value: newRole.id,
                    inline: true
                },
                {
                    name: "Role Color",
                    value: newRole.hexColor,
                    inline: true
                },
                {
                    name: "Role Position",
                    value: newRole.position,
                    inline: true
                },
                {
                    name: "Role Hoisted",
                    value: newRole.hoist,
                    inline: true
                },
                {
                    name: "Role Mentionable",
                    value: newRole.mentionable,
                    inline: true
                },
                {
                    name: "Old Role Permissions",
                    value: oldRole.permissions.toArray().map((permission) => `\`${permission}\``).join(", "),
                    inline: true
                },
                {
                    name: "New Role Permissions",
                    value: newRole.permissions.toArray().map((permission) => `\`${permission}\``).join(", "),
                    inline: true
                }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });

    }
}