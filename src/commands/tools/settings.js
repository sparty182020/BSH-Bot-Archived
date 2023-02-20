const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manage bot settings')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of setting to toggle')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Pings',
                        value: 'pings'
                    },
                    {
                        name: 'DMs',
                        value: 'dms'
                    }
                )
        )
        .addStringOption(option =>
            option.setName('toggle')
                .setDescription('Toggle the setting')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Enable',
                        value: 'enable'
                    },
                    {
                        name: 'Disable',
                        value: 'disable'
                    }
                )
        )
        .addStringOption(option =>
            option.setName('setting')
                .setDescription('Type of setting to toggle')
                .setRequired(false)
                .addChoices(
                    {
                        name: 'Level',
                        value: 'level'
                    }
                )
        ),
    info: {
        description: 'Manage your settings, don\'t want the bot to ping you? Turn it off!',
        usage: '/settings <pings/DMs> <on/off>',
        type: 'utility'
    },
    async execute(interaction, client) {
        const subcommand = interaction.options.getString('type');

        switch (subcommand) {
            case 'pings':
                client.sql.connection.query(`SELECT * FROM settings WHERE discordId = ${interaction.user.id}`, (err, rows, results) => {
                    if (err) throw err;

                    if (interaction.options.getString('setting') === 'level') {
                        if (interaction.options.getString('toggle') === 'enable') {
                            if (rows[0].levelPing === 1) {
                                const embed = new EmbedBuilder()
                                    .setTitle('Level Pings')
                                    .setDescription('Level pings are already enabled!')
                                    .setColor(client.color)
                                interaction.reply({ embeds: [embed] })
                            } else {
                                client.sql.connection.query(`UPDATE settings SET levelPing = 1 WHERE discordId = ${interaction.user.id}`, (err, rows) => {
                                    if (err) throw err;
                                    const embed = new EmbedBuilder()
                                        .setTitle('Level Pings')
                                        .setDescription('Level pings have been enabled!')
                                        .setColor(client.color)
                                    interaction.reply({ embeds: [embed] })
                                })
                            }
                        } else if (interaction.options.getString('toggle') === 'disable') {
                            if (rows[0].levelPing === 0) {
                                const embed = new EmbedBuilder()
                                    .setTitle('Level Pings')
                                    .setDescription('Level pings are already disabled!')
                                    .setColor(client.color)
                                interaction.reply({ embeds: [embed] })
                            } else {
                                client.sql.connection.query(`UPDATE settings SET levelPing = 0 WHERE discordId = ${interaction.user.id}`, (err, rows) => {
                                    if (err) throw err;
                                    const embed = new EmbedBuilder()
                                        .setTitle('Level Pings')
                                        .setDescription('Level pings have been disabled!')
                                        .setColor(client.color)
                                    interaction.reply({ embeds: [embed] })
                                })
                            }
                        }
                    } else {
                        interaction.reply({
                            content: `Please proivde a setting to toggle. (Level)`,
                            ephemeral: true
                        })
                    }
                })
                break;
            case 'dm':
                // disable/enable bot DMing that user
                await interaction.reply({
                    content: `Disabeling DMs is not currently supported.`,
                    ephemeral: true
                })
                break;
            default:
                await interaction.reply({
                    content: `Invalid subcommand.`,
                    ephemeral: true
                })
                break;
        }
    }
}