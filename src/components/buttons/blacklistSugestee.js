const { catchErrors } = require('../../functions/handlers/handleErrors');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: `blacklistSuggestee`
    },
    async execute(interaction, client) {
        const suggestionId = interaction.message.embeds[0].data.footer.text.replace('Suggestion ID: ', '');

        client.sql.connection.query(`SELECT * FROM suggestions WHERE suggestionId = '${suggestionId}'`, async (err, rows) => {
            if (err) throw err;
            
            const suggestion = rows[0].suggestion;
            const author = await interaction.guild.members.fetch(rows[0].userId);

            client.sql.connection.query(`UPDATE suggestions SET status = 'denied' WHERE suggestionId = '${suggestionId}'`);
            client.sql.connection.query(`UPDATE settings SET suggestionBlacklist = 1 WHERE discordId = '${author.id}'`);

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

            const logEmbed = new EmbedBuilder()
                .setTitle('Sugestee Blacklisted')
                .setDescription(`Sugestee \`${author.user.tag}\` has been blacklisted from suggesting.`)
                .setColor(0xff7f7f)
                .setFooter(client.footer);
            
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
            
            const blacklist = new ButtonBuilder()
                .setCustomId('blacklistSuggestee')
                .setLabel('Blacklist Suggestee')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true);

            await interaction.reply({
                content: `Blacklisted suggestee of suggestion with ID \`${suggestionId}\` (\`${author.user.tag}\`)`,
                ephemeral: true
            });

            await interaction.message.edit({
                embeds: [logChanEmbed],
                components: [new ActionRowBuilder().addComponents(approveBtn, denyBtn, blacklist)]
            })

            const logs = await client.channels.fetch('MOD_LOG_CHANNEL_ID');
            logs.send({ embeds: [logEmbed] });
        });
    }
}