const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge a number of messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of messages to purge').setMinValue(1).setRequired(true)),
    info: {
        description: 'Deletes the specified amount of messages',
        usage: '/purge <amount>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const number = interaction.options.getInteger('amount')

        const embed = client.embed()
            .setTitle(`${require('../../settings/emojis.json').badges.green} Purged ${number} messages`)

        await interaction.channel.bulkDelete(number);

        client.sql.createModLogs("purge", null, interaction.member.id, interaction.channel.id);
        await interaction.reply({ embeds: [embed] });

        await delay(2000)
        
        interaction.deleteReply()
    },
};