const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cases')
        .setDescription('Find the cases of a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('The member to pull cases from').setRequired(true)),
    info: {
        description: 'Get information on all the cases of a member',
        usage: '/cases <user>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const user = interaction.options.getUser('user')
        client.sql.connection.query(`SELECT * FROM punishLogs WHERE offenderId='${user.id}' AND logType <> 'deleted warn' ORDER BY logId ASC LIMIT 10`, async (err, results, rows) => {
            if (err) throw err;

            if (results.length < 1) {
                const embed = new EmbedBuilder()
                    .setTitle('No cases found')
                    .setDescription(`No cases found under user \`${user.tag} (${user.id})\``)
                    .setColor(0xff0000)
                return interaction.reply({ embeds: [embed] })
            }
            const info = [];
            for (let result of results) {
                const offender = await client.users.fetch(result.offenderId)
                const logType = result.logType.toUpperCase()
                const reason = result.logReason
                const logID = result.logId
                const duration = result.logDuration

                info.push(`\n\`${logType}\` | ${logID} - ${offender.id} - ${reason} - ${duration}`)
            }

            const embed = client.embed()
            if (results.length < 10) {
                embed.addFields([
                    {
                        name: 'Cases',
                        value: info.join(''),
                    }
                ])
            } else {
                embed.addFields([
                    {
                        name: 'Cases',
                        value: info.join('') + '\n[... View More](https://daad.wtf/panel/logs/punishmentlogs)',
                    }
                ])
            }
            await interaction.reply({
                embeds: [embed],
            })
        })
    },
};