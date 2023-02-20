const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('Find a case info')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addIntegerOption(option => option.setName('id').setDescription('The case id').setRequired(true)),
    info: {
        description: 'Find information about a specific case.',
        usage: '/case <id>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const id = interaction.options.getInteger('id')
        client.sql.connection.query(`SELECT * FROM punishLogs WHERE logId=${id}`, async (err, results, rows) => {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`No log with the id ${id} could be found.`)
                .setColor(0xff0000)
            if (err || results.length < 1) return interaction.reply({ embeds: [errorEmbed] })

            const { offenderId, logType, logReason: reason, logDuration: duration } = results[0]
            const offender = await client.users.fetch(offenderId)
            const embed = new EmbedBuilder()
                .setFields([
                    {
                        name: `Case Information for Case ID ${id}`,
                        value: [
                            `> **ID:** \`${id}\``,
                            `> **Type:** \`${logType.toUpperCase()}\``,
                            `> **User:** ${offender.tag} (\`${offender.id}\`)`,
                            `> **Reason:** ${reason}`,
                            `> **Duration:** ${duration}`
                        ].join('\n'),
                    }
                ])
                .setColor(client.color)
                .setTimestamp()
                .setThumbnail(offender.displayAvatarURL())
                .setFooter({
                    text: `Created by: ${(results[0].staffId === "AutoMod") ? 'AutoMod' : client.users.fetch(results[0].staffId).tag} | ${client.footer.text}`,
                    iconURL: results[0].staffId === "AutoMod" ? client.footer.iconURL : client.users.fetch(results[0].staffId).displayAvatarURL()
                })
            await interaction.reply({ embeds: [embed] })
        })
    },
};