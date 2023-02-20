const { catchErrors } = require("../../functions/handlers/handleErrors")
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'messageDelete',
    /**
     * 
     * @param {import('discord.js').Message} message 
     * @param {*} client 
     */
    async execute(message, client) {
        try {
            const channel = message.guild.channels.cache.get('MESSAGE_LOG_CHANNEL_ID')

            if (message.partial) {
                client.sql.connection.query(`SELECT * FROM messageLogs WHERE messageId = '${message.id}'`, async (err, rows, results) => {
                    if (err) throw err;
                    if (rows.length < 1) return;

                    const embed = new EmbedBuilder()
                    .setTitle('Message Deleted')
                    .setDescription(
                        [
                            `> **Author:** <@${rows[0].userId}> (\`${rows[0].userId}\`)`,
                            `> **Channel:** <#${rows[0].channelId}>`,
                            `> **Sent:** <t:${rows[0].timestamp}:R>`,
                            '',
                            `**Message:** ${rows[0].content}`
                        ].join('\n')
                    )
                    .setTimestamp()
                    .setFooter(client.footer)
                    .setColor(0xff0000)

                    await channel.send({
                        embeds: [embed]
                    })
                })
            } else {
                const created = Math.floor(new Date(message.createdAt) / 1000)

                const embed = new EmbedBuilder()
                .setTitle('Message Deleted')
                .setDescription(
                    [
                        `> **Author:** <@${message.author.id}> (\`${message.author.id}\`)`,
                        `> **Channel:** ${message.channel}`,
                        `> **Sent:** <t:${created}:R>`,
                        '',
                        `**Message:** ${message.content}`
                    ].join('\n')
                )
                .setTimestamp()
                .setFooter(client.footer)
                .setColor(0xff0000)

                const files = []

                if (message.attachments.size > 0) {
                    message.attachments.forEach(attachment => {
                        files.push(attachment.url)
                    })
                }

                await channel.send({
                    embeds: [embed],
                    files: files
                })
            }
        } catch (e) {
            catchErrors(e)
        }
    }
}