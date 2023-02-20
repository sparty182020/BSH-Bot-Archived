const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('List all channels added to the lockdown list')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a channel to the lockdown list')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to add to the lockdown list')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a channel from the lockdown list')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to remove from the lockdown list')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all channels added to the lockdown list')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start the lockdown')
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('The reason for the lockdown')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('end')
                .setDescription('End the lockdown')
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('The reason for ending the lockdown')
                        .setRequired(false)
                )
        ),
    info: {
        description: 'Manage the lockdown system - Add/Remove channels - Start/End a lockdown or list all channels in the lockdown list',
        usage: '/lockdown <add/remove/list/start/end> [channel]',
        type: 'moderation',
    },
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        let channels = [];

        if (subcommand === 'add') {
            const channel = interaction.options.getChannel('channel') || interaction.channel

            client.sql.connection.query(`SELECT offenderId FROM modLogs WHERE logType='lockdownChannelAdd'`, async (err, results, rows) => {
                if (err) throw err;

                results.forEach(result => channels.push(result.offenderId))

                if (channels.includes(channel.id)) {
                    const embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setFooter(client.footer)
                        .setFields([
                            {
                                name: `That channel is already in the lockdown list`,
                                value: `${channel}`,
                            }
                        ])
                    await interaction.reply({ embeds: [embed] })
                    channels = [];
                    return;
                }
                const embed = client.embed()
                    .setFields([
                        {
                            name: `${require('../../settings/emojis.json').badges.green} Added channel to lockdown list`,
                            value: `${channel}`,
                        }
                    ])

                client.sql.createModLogs("lockdownChannelAdd", null, interaction.member.id, channel.id);

                await interaction.reply({ embeds: [embed] })
                channels = [];
            })
        } else if (subcommand === 'remove') {
            const channel = interaction.options.getChannel('channel') || interaction.channel

            client.sql.connection.query(`SELECT * FROM modLogs WHERE logType='lockdownChannelAdd'`, async (err, results, rows) => {
                if (err) throw err;

                results.forEach(result => channels.push(result.offenderId))

                if (channels.includes(channel.id)) {
                    const embed = client.embed()
                        .setFields([
                            {
                                name: `Removed channel from lockdown list`,
                                value: `${channel}`,
                            }
                        ])
                    client.sql.connection.query(`UPDATE modLogs SET logType = 'lockdownChannelRemove' WHERE offenderId = ${channel.id}`)
                    await interaction.reply({ embeds: [embed] })
                    channels = [];
                    return;
                }
                const embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setFooter(client.footer)
                    .setFields([
                        {
                            name: `That channel is not in the lockdown list`,
                            value: `${channel}`,
                        }
                    ])
                await interaction.reply({ embeds: [embed] })
                channels = [];
            })
        } else if (subcommand === 'list') {
            client.sql.connection.query(`SELECT offenderId FROM modLogs WHERE logType='lockdownChannelAdd'`, async (err, results, rows) => {
                if (err) throw err;

                results.forEach(result => channels.push(`<#${result.offenderId}>`))

                const embed = client.embed()
                    .setTitle('List of lockdown channels')
                    .setDescription(channels.join('\n'))

                await interaction.reply({ embeds: [embed] })
            })
        } else if (subcommand === 'start') {
            const reason = interaction.options.getString('reason') || null;

            client.sql.connection.query(`SELECT offenderId FROM modLogs WHERE logType = 'lockdownChannelAdd'`, async (err, results, rows) => {
                if (err) throw err;

                client.sql.createModLogs("lockdownStart", reason, interaction.member.id, interaction.channel.id);

                const reasonEmbed = client.embed()
                    .setTitle('Lockdown')
                    .setDescription(`${reason}`)

                if (reason != null) {
                    for (let result of results) {
                        const channel = client.channels.cache.get(result.offenderId);
                        channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                        channel.send({ embeds: [reasonEmbed] })
                    }
                } else {
                    results.forEach(async result => 
                    await client.channels.cache.get(result.offenderId).permissionOverwrites.edit(interaction.guild.id, { SendMessages: false })
                    )
                    if (!reason === null) {
                        client.channels.cache.get(result.offenderId).send({ embeds: [reasonEmbed] }) 
                    }
                }

                const embed = client.embed()
                    .setTitle('Lockdown Started')
                    .setDescription(`Locking ${results.length} channels.`)
                await interaction.reply({
                    embeds: [embed]
                })
            })
        } else if (subcommand === 'end') {
            const reason = interaction.options.getString('reason') || null;

            client.sql.connection.query(`SELECT offenderId FROM modLogs WHERE logType = 'lockdownChannelAdd'`, async (err, results, rows) => {
                if (err) throw err;

                client.sql.createModLogs("lockdownEnd", reason, interaction.member.id, interaction.channel.id);

                const reasonEmbed = client.embed()
                    .setTitle('Lockdown Ended')
                    .setDescription(`${reason}`)

                if (reason != null) {
                    for (let result of results) {
                        const channel = client.channels.cache.get(result.offenderId);
                        channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                        channel.send({ embeds: [reasonEmbed] })
                    }
                } else {
                    results.forEach(async result => 
                    await client.channels.cache.get(result.offenderId).permissionOverwrites.edit(interaction.guild.id, { SendMessages: null })
                    )
                    if (!reason === null) {
                        client.channels.cache.get(result.offenderId).send({ embeds: [reasonEmbed] }) 
                    }
                }

                const embed = client.embed()
                    .setTitle('Lockdown Ended')
                    .setDescription(`Unlocking ${results.length} channels.`)
                await interaction.reply({
                    embeds: [embed]
                })
            })
        }
    },
};