const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: `approveSuggestion`
    },
    async execute(interaction, client) {
        const suggestionId = interaction.message.embeds[0].data.footer.text.replace('Suggestion ID: ', '')

        client.sql.connection.query(`SELECT * FROM suggestions WHERE suggestionId = '${suggestionId}'`, async (err, rows) => {
            if (err) throw err;

            client.sql.connection.query(`UPDATE suggestions SET status = 'pending review' WHERE suggestionId = '${suggestionId}'`);

            const suggestion = rows[0].suggestion;
            const author = await interaction.guild.members.fetch(rows[0].userId);
            const channel = interaction.guild.channels.cache.get('SUGGESTION_CHANNEL_ID');

            const logChanEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${author.user.tag}`,
                    iconURL: author.user.displayAvatarURL()
                })
                .setDescription(suggestion)
                .setColor(client.color)
                .addFields([
                    {
                        name: 'Status',
                        value: '\`PENDING VOTE\`',
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
                content: `Approved suggestion \`${suggestionId}\``,
                ephemeral: true
            });

            await interaction.message.edit({
                embeds: [logChanEmbed],
                components: [new ActionRowBuilder().addComponents(approveBtn, denyBtn)]
            })

            const sgstEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${author.user.tag}`,
                    iconURL: author.user.displayAvatarURL()
                })
                .setDescription(suggestion)
                .setColor(client.color)
                .addFields({
                    name: 'Status',
                    value: '\`PENDING VOTE\`',
                })
                .setFooter({ text: `Suggestion ID: ${suggestionId}` });
            
            await channel.send({
                embeds: [sgstEmbed],
            }).then((msg) => {
                msg.react('👍');
                msg.react('👎');

            const sgstMessageId = msg.id;
            client.sql.connection.query(`UPDATE suggestions SET sgstMessageId = '${sgstMessageId}' WHERE suggestionId = '${suggestionId}'`);
            })
        });
    }
}