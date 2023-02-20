const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whisper')
        .setDescription('Anonymously send a message to the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('What you want the bot to say')
                .setRequired(true)
        ),
    info: {
        description: 'Anonymously send a message to the channel',
        usage: '/whisper <text>',
        type: 'fun'
    },
    async execute(interaction, client) {
        const text = interaction.options.getString('text');
        const embed = client.embed()
            .setTitle('New Message from someone')
            .setDescription(text)
            .setTimestamp(new Date())
        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: `${require('../../settings/emojis.json').badges.green} Sent`, ephemeral: true });
    },
};
