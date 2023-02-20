const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Returns info about specified role')
        .addRoleOption(option => option.setName('role').setDescription('The role to get information about').setRequired(true)),
    info: {
        description: 'Get some information about a role (name, ID, color, hoisted, mentionable, permissions',
        usage: '/roleinfo',
        type: 'utility'
    },
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');
        const roleCreated = Math.floor(new Date(role.createdAt) / 1000)

        const roleEmbed = client.embed()
            .setTitle(interaction.options.getRole('role').name)
            .setThumbnail(interaction.options.getRole('role').iconURL())
            .addFields([
                {
                    name: '_ _',
                    value: `**Role ID:** \`${role.id}\`\n**Colour:** \`${role.hexColor}\`\n**Mentionable:** \`${role.mentionable}\`\n**Hoisted:** \`${role.hoist}\`\n**Created:** <t:${roleCreated}:f>\n**Position:** \`${role.position}\``,
                    inline: false
                }
            ])

        await interaction.reply({
            embeds: [roleEmbed]
        })
    }
}