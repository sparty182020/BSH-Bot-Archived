const { catchErrors } = require("../../functions/handlers/handleErrors")
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        try {
            if (!oldMessage.guild) {
                return;
            }

            const channel = oldMessage.guild.channels.cache.get('MESSAGE_LOG_CHANNEL_ID')
            
            if (oldMessage.partial) {
                client.sql.connection.query(`SELECT * FROM messageLogs WHERE messageId = '${oldMessage.id}'`, async (err, rows, results) => {
                    if (err) throw err;
                    if (rows.length < 1) return;

                    if (rows[0].updatedContent == null) var oldContent = rows[0].content;
                    else var oldContent = rows[0].updatedContent;

                    const embed = new EmbedBuilder()
                    .setTitle('Message Updated')
                    .setDescription(
                        [
                            `> **Author:** <@${rows[0].userId}> (\`${rows[0].userId}\`)`,
                            `> **Channel:** <#${rows[0].channelId}>`,
                            `> **Sent:** <t:${rows[0].timestamp}:R>`,
                            '',
                            `**Old Message:**`,
                            `${oldContent}`,
                            `**New Message:**`,
                            `${newMessage.content}`
                        ].join('\n')
                    )
                    .setTimestamp()
                    .setFooter(client.footer)
                    .setColor(0xe69b00)

                    await channel.send({
                        embeds: [embed]
                    })
                })

                client.sql.connection.query(`UPDATE messageLogs SET updatedContent = '${newMessage.content}' WHERE messageId = '${oldMessage.id}'`)
            } else {
                if (oldMessage.author.bot) return;
                const created = Math.floor(new Date(newMessage.createdAt) / 1000)

                const embed = new EmbedBuilder()
                .setTitle('Message Updated')
                .setDescription(
                    [
                        `> **Author:** <@${newMessage.author.id}> (\`${newMessage.author.id}\`)`,
                        `> **Channel:** ${newMessage.channel}`,
                        `> **Sent:** <t:${created}:R>`,
                        '',
                        `**Old Message:**`,
                        `${oldMessage.content}`,
                        `**New Message:**`,
                        `${newMessage.content}`
                    ].join('\n')
                )
                .setTimestamp()
                .setFooter(client.footer)
                .setColor(0xe69b00)

                await channel.send({
                    embeds: [embed]
                })

                client.sql.connection.query(`UPDATE messageLogs SET updatedContent = '${newMessage.content}' WHERE messageId = '${oldMessage.id}'`)
            }
        } catch (e) {
            catchErrors(e)
        }
    }
}