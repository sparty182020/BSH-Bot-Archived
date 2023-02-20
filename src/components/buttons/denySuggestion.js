const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: `denySuggestion`
    },
    async execute(interaction, client) {
        const suggestionId = interaction.message.embeds[0].data.footer.text.replace('Suggestion ID: ', '');

        client.sql.connection.query(`SELECT * FROM suggestions WHERE suggestionId = '${suggestionId}'`, async (err, rows) => {
            if (err) throw err;

            client.sql.connection.query(`UPDATE suggestions SET status = 'denied' WHERE suggestionId = '${suggestionId}'`);

            const suggestion = rows[0].suggestion;
            const author = await interaction.guild.members.fetch(rows[0].userId);

            const logChanEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${author.user.tag}`,
                    iconURL: author.user.displayAvatarURL()
                })
                .setDescription(suggestion)
                .setColor(0xff7f7f)
                .addFields([
                    {
                        name: 'Status',
                        value: '\`DENIED\`',
                    }
                ])
                .setFooter({ text: `Suggestion ID: ${suggestionId}` });
            
            const approveBtn = new ButtonBuilder()
                .setCustomId('approveSuggestion')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);

            const denyBtn = new ButtonBuilder()
                .setCustomId('denySuggestion')
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true);

            await interaction.reply({
                content: `Denied suggestion \`${suggestionId}\``,
                ephemeral: true
            });

            await interaction.message.edit({
                embeds: [logChanEmbed],
                components: [new ActionRowBuilder().addComponents(approveBtn, denyBtn)]
            })
        });
    }
}