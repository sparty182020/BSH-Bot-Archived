const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('t-leaderbord')
        .setDescription('Send the ticket leaderboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    info: {
        description: 'Order the staff with the most claims',
        usage: '/t-leaderboard',
        type: 'administration'
    },
    async execute(interaction, client) {
        await interaction.deferReply();

        client.sql.connection.query(`SELECT DISTINCT staffId FROM tickets`, async (err, rows, results) => {
            if (err) throw err;

            const staff = [];

            for (let i = 0; i < rows.length; i++) {
                staff.push(rows[i].staffId)
            }

            const counts = []

            const combined = []

            for (let i = 0; i < staff.length; i++) {
                client.sql.connection.query(`SELECT * FROM tickets WHERE staffId = ${staff[i]}`, async (err, rows, results) => {
                    if (err) throw err;
                    counts.push(rows.length);
                    combined.push({ staff: staff[i], count: rows.length })
                })
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            combined.shift()
            combined.sort((a,b) => {
                if (a.count > b.count) return -1
                if (a.count < b.count) return 1
                return 0
            })

            const final = []

            for (let x of combined) {
                if (x.count == 0) {
                    combined.splice(combined.indexOf(x), 1)
                }
                final.push(`<@${x.staff}> - ${x.count} claims`)
            }

            const embed = client.embed()
                .setTitle('Ticket Leaderboard')
                .setDescription(final.join('\n'))
                .setTimestamp()

            await interaction.editReply({ embeds: [embed] });
        });
    }
}