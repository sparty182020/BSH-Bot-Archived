const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { catchErrors } = require('../../functions/handlers/handleErrors');

module.exports = {
    data: {
        name: `openTicket`
    },
    async execute(interaction, client) {
        client.sql.connection.query(`SELECT ticketBlacklist FROM settings WHERE discordId = ${interaction.user.id}`, async (err, brows, bresults) => {
            if (err) throw err;

            if (brows[0].ticketBlacklist === 1) {
                await interaction.reply({
                    content: `You are blocked from using this command.`,
                    ephemeral: true,
                })
                return;
            }

            const ticketData = {
                memberId: interaction.member.id,
            }
            
            client.sql.connection.query(`INSERT INTO tickets SET ?`, ticketData, async (err, result) => {
                if (err) throw err;

                interaction.deferReply({
                    ephemeral: true
                });

                client.sql.connection.query(`SELECT * FROM tickets WHERE memberId = ${interaction.user.id} ORDER BY ticketId DESC`, async (err, results) => {
                    await interaction.guild.channels.create({
                        type: ChannelType.GuildText,
                        name: `ticket-${results[0].ticketId}`,
                        parent: '1008327752463695982',
                    }).then(async (channel) => {
                        channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
                        channel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });
                        channel.permissionOverwrites.edit('1004426132667498666', { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });

                        client.sql.connection.query(`UPDATE tickets SET channelId = ${channel.id} WHERE ticketId = ${results[0].ticketId}`);

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

                        if (interaction.channel.id === '1005551806610411604') {
                            await channel.send({
                                embeds: [embed],
                                content: `<@${interaction.member.id}>`,
                                components: [new ActionRowBuilder().addComponents(close, claim)]
                            }).then(msg => {
                                client.sql.connection.query(`UPDATE tickets SET messageId = ${msg.id} WHERE ticketId = ${results[0].ticketId}`);
                            })
                        } else {
                            await channel.send({
                                embeds: [embed],
                                content: require('../../settings/developers.json').developers.includes(interaction.user.id) ? 
                                `${interaction.member}`
                                :`${interaction.member} <@&999313587300487168>`,
                                components: [new ActionRowBuilder().addComponents(close, claim)]
                            }).then(msg => {
                                client.sql.connection.query(`UPDATE tickets SET messageId = ${msg.id} WHERE ticketId = ${results[0].ticketId}`);
                            })
                        }

                        await interaction.editReply({
                            content: `A ticket has been created. ${channel}`,
                            ephemeral: true
                        })
                    }).catch(catchErrors);
                })
            })
        })
    }
}