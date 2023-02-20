module.exports = {
    name: 'roleDelete',
    async execute(role, client) {
        const logChannel = client.channels.cache.get("SERVER_LOG_CHANNEL_ID");

        const embed = client.embed()
            .setAuthor(role.guild.name, role.guild.iconURL({ dynamic: true }))
            .setTitle("Role Deleted")
            .setDescription(`**Role Name:** ${role.name}`)
            .addFields(
                {
                    name: "Role ID",
                    value: role.id,
                    inline: true
                },
                {
                    name: "Role Color",
                    value: role.hexColor,
                    inline: true
                },
                {
                    name: "Role Position",
                    value: role.position,
                    inline: true
                },
                {
                    name: "Role Hoisted",
                    value: role.hoist,
                    inline: true
                },
                {
                    name: "Role Mentionable",
                    value: role.mentionable,
                    inline: true
                },
                {
                    name: "Role Permissions",
                    value: role.permissions.toArray().map((permission) => `\`${permission}\``).join(", "),
                    inline: true
                }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
}