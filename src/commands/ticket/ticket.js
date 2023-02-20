const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Add/Remove a member from the ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a member to the ticket')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to add to the ticket')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a member from the ticket')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to remove from the ticket')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unclaim')
                .setDescription('Force unclaim the ticket')
        ),
    info: {
        description: 'Add/Remove a member from the ticket to allow/deny them access to the ticket.',
        usage: '/ticket <add|remove|unclaim> <user>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        // detecting if the command is ran in a ticket
        if (!interaction.channel.name.includes('ticket-')) {
            await interaction.reply({
                content: `You cannot use this command outside of a ticket.`,
                ephemeral: true,
            })
            return;
        }

        // if in a ticket
        client.sql.connection.query(`SELECT * FROM tickets WHERE channelId = ${interaction.channel.id}`, async (err, results) => {
            if (err) throw err;
            const user = interaction.options.getUser('user');

            switch (subcommand) {
                case 'add':
                    if (user.id === results[0].memberId) {
                        await interaction.reply({
                            content: `You cannot add the ticket creator to the ticket.`,
                            ephemeral: true,
                        })
                        return;
                    } else {
                        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true });

                        await interaction.reply({
                            content: `Added ${user} to the ticket.`,
                            ephemeral: true,
                        })
                    }
                    break;
                case 'remove':
                    if (user.id === results[0].memberId) {
                        await interaction.reply({
                            content: `You cannot remove the ticket creator from the ticket.`,
                            ephemeral: true,
                        })
                        return;
                    } else {
                        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });

                        await interaction.reply({
                            content: `Removed ${user} from the ticket.`,
                            ephemeral: true,
                        })
                    }
                    break;
                case 'unclaim':
                    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;
                    const message = await interaction.channel.messages.fetch(results[0].messageId);

                    // detecting if ticket is claimed
                    if (results[0].staffId === null) {
                        await interaction.reply({
                            content: `This ticket is not claimed.`,
                            ephemeral: true,
                        })
                        return;
                    }

                    // if ticket is claimed
                    client.sql.connection.query(`UPDATE tickets SET staffId = NULL WHERE channelId = ${interaction.channel.id}`, async (err, result) => {
                        if (err) throw err;

                        const unclaimEmbed = client.embed()
                            .setTitle(`Ticket Unclaimed`)
                            .setDescription(`<@${results[0].staffId}> will no longer be assisting you with this ticket.`)

                        await interaction.reply({
                            content: `Force unclaimed ticket...`,
                            ephemeral: true,
                        })

                        await message.reply({
                            embeds: [unclaimEmbed]
                        })

                        // editing main message sent by bot
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

                            await message.edit({
                                embeds: [embed],
                                components: [new ActionRowBuilder().addComponents(close, claim)]
                            })
                        })
                    })
                    break;
            }
        });
    }
}