const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Returns info about the server'),
    info: {
        description: 'Get some information about the server',
        usage: '/serverinfo',
        type: 'utility'
    },
    async execute(interaction, client) {
        const owner = await client.users.fetch(interaction.guild.ownerId);
        const serverCreated = Math.floor(new Date(interaction.guild.createdAt) / 1000);

        const serverEmbed = client.embed()
            .setTitle(interaction.guild.name)
            .setDescription(`${interaction.guild.description}`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields([
                {
                    name: '_ _',
                    value: `**Owner:** <@${owner.id}> (${owner.tag})\n**Guild ID:** \`${interaction.guild.id}\`\n**Created:** <t:${serverCreated}:f>`,
                    inline: true
                },
                {
                    name: '_ _',
                    value: `**Members:** ${interaction.guild.memberCount}\n**Channels:** ${interaction.guild.channels.cache.size}\n**Roles:** ${interaction.guild.roles.cache.size}`,
                    inline: true
                }
            ]);

        await interaction.reply({
            embeds: [serverEmbed]
        })
    }
}