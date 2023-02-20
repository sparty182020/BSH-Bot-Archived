const { connection } = require('../../internalSRC/connection');

module.exports = {
    data: {
        name: `enterGiveaway`
    },
    async execute(interaction, client) {
        client.sql.connection.query(`SELECT * FROM giveaways WHERE messageId = '${interaction.message.id}'`, async (err, rows, results) => {
            if (err) throw err;
            if (rows.length < 1) return;
        
            const giveawayId = rows[0].giveawayId;
        
            if (rows[0].ended === 1) {
                await interaction.reply({ content: 'This giveaway has already ended', ephemeral: true })
                return;
            } else {
                client.sql.connection.query(`SELECT memberId FROM giveaway${giveawayId}`, async (err, rows, results) => {
                    if (err) throw err;
                    if (rows.length < 1) return;
        
                    const entries = [];
                    for (let i = 0; i < rows.length; i++) entries.push(rows[i].memberId)
        
                    if (entries.includes(interaction.user.id)) {
                        await interaction.reply({ content: 'You have already entered this giveaway', ephemeral: true })
                        return;
                    } else {
                        const theId = {
                            memberId: interaction.user.id,
                        };
        
                        await interaction.reply({
                            content: `${require('../../settings/emojis.json').badges.green} You have entered the giveaway. If any issues pop up please DM an admin with the giveaway ID: \`${giveawayId}\``,
                            ephemeral: true
                        });
        
                        client.sql.connection.query(`INSERT INTO giveaway${giveawayId} SET ?`, theId)
                    }
                })
            }
        })
    }
}