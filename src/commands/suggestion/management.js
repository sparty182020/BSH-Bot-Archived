const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('s-manage')
        .setDescription('Suggestion Management commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a suggestion')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The suggestion ID')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('The reason for deleting the suggestion')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Change the status of a suggestion')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The suggestion ID')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('status')
                        .setDescription('The new status of the suggestion')
                        .setRequired(true)
                        .addChoices(
                            {
                                name: 'Approved',
                                value: 'approved'
                            },
                            {
                                name: 'Denied',
                                value: 'denied'
                            },
                            {
                                name: 'In Review',
                                value: 'in review'
                            },
                            {
                                name: 'Implemented',
                                value: 'implemented'
                            }
                        )
                )
        )
        .addSubcommand(
            subcommand =>
                subcommand
                    .setName('blacklist')
                    .setDescription('Blacklist a user from suggesting')
                    .addUserOption(option =>
                        option
                            .setName('user')
                            .setDescription('The user to blacklist')
                            .setRequired(true)
                    )
        ),
    info: {
        description: 'Command used to control the suggestion system',
        usage: '/s-manage <delete|status|blacklist> <id/user> <reason>',
        type: 'administration'
    },
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const suggestionId = interaction.options.getString('id');

        switch (subcommand) {
            case 'approve':
                // approve a suggestion (if been approved in approve channel)
                break;
            case 'deny':
                // deny a suggestion (if been approved in approve channel)
                break;
            case 'delete':
                client.sql.connection.query(`SELECT * FROM suggestions WHERE suggestionId = '${suggestionId}'`, async (err, rows, results) => {
                    if (err) throw err;

                    const channel = interaction.guild.channels.cache.get('SUGGESTION_CHANNEL_ID');
                    const msg = await channel.messages.fetch(rows[0].sgstMessageId);

                    await msg.delete()
                    client.sql.connection.query(`DELETE FROM suggestions WHERE suggestionId = '${suggestionId}'`);

                    const embed = new EmbedBuilder()
                        .setTitle('Suggestion Deleted')
                        .setDescription(`**Suggestion ID:** ${suggestionId}\n**Suggestion:** ${rows[0].suggestion}`)
                        .setColor(0xff0000)
                        .setFooter({
                            text: `Deleted by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    interaction.reply({ embeds: [embed] });
                });
                break;
            case 'status':
                client.sql.connection.query(`SELECT * FROM suggestions WHERE suggestionId = '${suggestionId}'`, async (err, rows, results) => {
                    if (err) throw err;

                    const channel = interaction.guild.channels.cache.get('SUGGESTION_CHANNEL_ID');
                    const msg = await channel.messages.fetch(rows[0].sgstMessageId);
                    
                    const status = interaction.options.getString('status');
                    const user = client.guilds.cache.get('SERVER_ID').members.cache.get(rows[0].userId);

                    client.sql.connection.query(`UPDATE suggestions SET status = '${status}' WHERE suggestionId = '${suggestionId}'`);

                    const embed = new EmbedBuilder()
                        .setTitle('Suggestion Status Changed')
                        .setDescription(`**Suggestion ID:** \`${suggestionId}\`\n**Suggestion:** ${rows[0].suggestion}\n**New Status:** \`${status.toUpperCase()}\`\n**Changed By:** ${interaction.user.tag}`)
                        .setColor(0xff8c00)
                        .setFooter(client.footer)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });

                    const newSuggestionEmbed = new EmbedBuilder()
                        .setAuthor({
                            name: `${user.user.username + '#' + user.user.discriminator} suggested:`,
                            iconURL: user.displayAvatarURL()
                        })
                        .setDescription(rows[0].suggestion)
                        .setColor(client.color)
                        .addFields([
                            {
                                name: 'Status',
                                value: `\`${status.toUpperCase()}\``,
                            }
                        ])
                        .setFooter({
                            text: `Suggestion ID: ${suggestionId}`
                        })
                        .setTimestamp();
                    
                    await msg.edit({
                        embeds: [newSuggestionEmbed]
                    })
                });
                break;
            case 'blacklist':
                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason') || 'No reason provided';

                client.sql.connection.query(`SELECT suggestionBlacklist FROM settings WHERE discordId = ${interaction.user.id}`, async (err, rows, results) => {
                    if (err) throw err;

                    if (rows[0].suggestionBlacklist === 0) {
                        const addEmbed = new EmbedBuilder()
                            .setTitle('Suggestion Blacklist')
                            .setDescription(`You have been blacklisted from making suggestions in **${interaction.guild.name}**.`)
                            .setThumbnail(user.displayAvatarURL())
                            .setColor(client.color)
                            .setFields([
                                {
                                    name: 'Reason',
                                    value: `${reason}`
                                }
                            ])
                            .setFooter({
                                text: `Blacklisted by ${interaction.user.tag} | ${client.footer.text}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            });
                        
                        client.sql.connection.query(`UPDATE settings SET suggestionBlacklist = 1 WHERE discordId = ${user.id}`, (err, rows) => {
                            if (err) throw err;
                        })

                        await interaction.reply({
                            content: `${require('../../settings/emojis.json').badges.green} You have added <@${user.id}> to the suggestion blacklist.`,
                        })
                        await user.send({ embeds: [addEmbed] })
                    } else {
                        const removeEmbed = new EmbedBuilder()
                            .setTitle('Suggestion Blacklist')
                            .setDescription(`You have been unblacklisted from making suggestions in **${interaction.guild.name}**.\nMake sure you are following the rules and being careful next time.`)
                            .setThumbnail(user.displayAvatarURL())
                            .setColor(client.color)
                            .setFooter({
                                text: `Unblacklisted by ${interaction.user.tag} | ${client.footer.text}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            });
                        
                        client.sql.connection.query(`UPDATE settings SET suggestionBlacklist = 1 WHERE discordId = ${user.id}`, (err, rows) => {
                            if (err) throw err;
                        })
                        
                        await interaction.reply({
                            content: `${require('../../settings/emojis.json').badges.green} You have removed <@${user.id}> from the suggestion blacklist. **Reason:** ${reason}`,
                        })
                        await user.send({ embeds: [removeEmbed] })
                    }
                })
                break;
        }
    }
}