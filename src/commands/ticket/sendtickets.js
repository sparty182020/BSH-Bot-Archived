const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendtickets')
        .setDescription('Send Ticket Message')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the message in').setRequired(true)),
    info: {
        description: 'Send the tickets embed and buttons',
        usage: '/sendtickets',
        type: 'administration'
    },
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');

        const embed = client.embed()
            .setTitle('Request Support')
            .setDescription('Support tickets are a easy way to comunicate with the staff team. To create a ticket, click the button below.')
        
            const button = new ButtonBuilder()
                .setCustomId('openTicket')
                .setEmoji('🎫')
                .setLabel('Open Ticket')
                .setStyle(ButtonStyle.Primary)

        await interaction.reply({
            content: "Sending Ticket Message...",
            ephemeral: true
        })

        await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(button)]
        })
    }
}