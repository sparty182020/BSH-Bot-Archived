const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: `closeTicket`
    },
    async execute(interaction, client) {
        const channel = await interaction.guild.channels.fetch(interaction.channelId);

        client.sql.connection.query(`SELECT * FROM tickets WHERE channelId = ${channel.id}`, async (err, results) => {
            if (err) throw err;

            if (results.length === 0) {
                await interaction.reply({
                    content: `This channel is not a ticket.`,
                    ephemeral: true,
                })
                return;
            } else {
                const embed = client.embed()
                    .setTitle(`Close Confimation`)
                    .setDescription(`This ticket has been requested to be closed.\nIf this ticket has been dealt with correctly please confirm the close.`)

                const closeconfirm = new ButtonBuilder()
                    .setCustomId('closeTicketConfirm')
                    .setEmoji('🔒')
                    .setLabel('Confirm Close')
                    .setStyle(ButtonStyle.Danger)
                
                await interaction.reply({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(closeconfirm)]
                })
            }
        });
    }
}