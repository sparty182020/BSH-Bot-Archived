const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: {
        name: `unclaimTicket`
    },
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has('SUPPORT_STAFF_ROLE_ID')) {
            await interaction.reply({
                content: `You cannot unclaim a ticket.`,
                ephemeral: true,
            })
            return;
        }

        client.sql.connection.query(`SELECT * FROM tickets WHERE channelId = ${interaction.channel.id}`, async (err, results) => {
            if (err) throw err;

            if (results[0].staffId !== interaction.member.id) {
                await interaction.reply({
                    content: `You cannot unclaim a ticket that you did not claim.`,
                    ephemeral: true,
                })
                return;
            } else {
                client.sql.connection.query(`UPDATE tickets SET staffId = NULL WHERE channelId = ${interaction.channel.id}`, async (err, result) => {
                    if (err) throw err;

                    const unclaimEmbed = client.embed()
                        .setTitle(`Ticket Unclaimed`)
                        .setDescription(`<@${interaction.member.id}> will no longer be assisting you with this ticket.`)

                    await interaction.reply({
                        embeds: [unclaimEmbed]
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
                            
                        const claim = new ButtonBuilder()
                            .setCustomId('claimTicket')
                            .setEmoji('🙋‍♂️')
                            .setLabel('Claim Ticket')
                            .setStyle(ButtonStyle.Success)

                        await interaction.message.edit({
                            embeds: [embed],
                            components: [new ActionRowBuilder().addComponents(close, claim)]
                        })
                    })
                })
            }
        });
    }
}