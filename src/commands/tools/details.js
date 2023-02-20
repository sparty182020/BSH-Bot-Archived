const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('details')
        .setDescription('Gets the server information')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(
            option =>
                option
                    .setName('type')
                    .setDescription('The type of information you want to get')
                    .setRequired(true)
        ),
    info: {
        description: 'Get information about the server',
        usage: '/details <type>',
        type: 'tools'
    },
    async execute(interaction, client) {
        const type = interaction.options.getString('type').toLowerCase();
        if (!interaction.member.roles.cache.has('STAFF_ROLE_ID')) return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        await fetch(`https://bsh.daad.wtf/api/qd/${type}`)
            .then(async res => {
                if (res.status !== 400 && res.status !== 404) return res.json();
                return await interaction.reply('Invalid type');
            })
            .then(async res => {
                const embed = new EmbedBuilder()
                    .setTitle(res.title)
                    .setDescription(res.description)
                    .setTimestamp(Date.now())
                    .setColor(0x00aa00)
                    .setFooter(client.footer);
                return await interaction.reply({ embeds: [embed] });
            })
    },
};