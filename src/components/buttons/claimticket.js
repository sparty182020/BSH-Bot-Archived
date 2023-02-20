const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: `claimTicket`
    },
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has('1004426132667498666')) {
            await interaction.reply({
                content: `You cannot claim a ticket.`,
                ephemeral: true,
            })
            return;
        } else {
            client.sql.connection.query(`UPDATE tickets SET staffId = ${interaction.member.id} WHERE channelId = ${interaction.channel.id}`, async (err, result) => {
                if (err) throw err;

                const claimEmbed = client.embed()
                    .setTitle(`Ticket Claimed`)
                    .setDescription(`<@${interaction.member.id}> will be assisting you with your issue.`)

                await interaction.reply({
                    embeds: [claimEmbed]
                })

                client.sql.connection.query(`SELECT * FROM tickets WHERE channelId = ${interaction.channel.id}`, async (err, results) => {
                    const embed = client.embed()
                        .setTitle(`Ticket #${results[0].ticketId}`)
                        .setDescription(`Thank you for contacting the support team. Please describe your issue below and wait patiently for support.`)
                    
                    const close = new ButtonBuilder()
                        .setCustomId('closeTicket')
                        .setEmoji('🔒')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        
                    const unclaim = new ButtonBuilder()
                        .setCustomId('unclaimTicket')
                        .setEmoji('🙅‍♂️')
                        .setLabel('Unclaim Ticket')
                        .setStyle(ButtonStyle.Success)

                    await interaction.message.edit({
                        embeds: [embed],
                        components: [new ActionRowBuilder().addComponents(close, unclaim)]
                    })
                })
            })
        }
    }
}