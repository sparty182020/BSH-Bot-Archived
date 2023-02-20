const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ban = require('./ban');

/**
 * 
 * @param {import('discord.js').Client} client 
 * @param {import('discord.js').Message} message 
 */

const message = async (client, message) => {
    const channel = message.guild.channels.cache.get('AUTOMOD_CHANNEL_ID');
    client.sql.connection.query(`SELECT * FROM bannedWords`, async (err, rows, _) => {
        if (err) throw err;
    
        const { whitelisted } = require('../dependancies.js');
    
        const terms = rows.map(row => row.word)
        for (const word of terms) {
            // if message is whitelisted stop
            if (whitelisted.includes(word)) return;

            // if not delete and run through punish system
            if (message.content.toLowerCase().includes(word)) {
                message.delete();

                const embed = new EmbedBuilder()
                    .setTitle('Auto Moderation')
                    .setDescription(
                        [
                            `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                            `> **Channel:** ${message.channel}`,
                            '',
                            `> **Message:** ${message.content}`,
                            `> **Word:** ${word}`,
                            '',
                            `> **Action:** Delete`
                        ].join('\n')
                    )
                    .setTimestamp(Date.now())
                    .setFooter(client.footer)
                    .setColor(0xff0000)

                if (message.member.roles.cache.has('STAFF_ROLE_ID')) {
                    embed
                        .setDescription(
                            [
                                `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                                `> **Channel:** ${message.channel}`,
                                '',
                                `> **Message:** ${message.content}`,
                                `> **Word:** ${word}`
                            ].join('\n')
                        )
                    channel.send({
                        embeds: [embed]
                    })
                    return;
                }

                const reason = `(AutoMod) Banned word: ${word}`;

                client.sql.connection.query(`SELECT * FROM bannedWords WHERE word = '${word}'`, (err, rows, results) => {
                    if (err) throw err;

                    const duration = rows[0].punishTime;

                    if (rows[0].punishType === 'ban') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Banned`)
                            .setDescription(
                                [
                                    `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                                    `> **Channel:** ${message.channel}`,
                                    '',
                                    `> **Message:** ${message.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Ban`,
                                    `> **Duration:** ${duration || 'Permanent'}`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const banEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Ban`)
                            .setDescription(`> **Reason:** ${reason}\n> **Duration:** ${duration || 'Permanent'}`)
                            .setColor(0xff0000)
                            .setTimestamp(Date.now())
                            .setFooter(client.footer)

                        const banStatus = ban(client, message.member.id, "Automod", message.channel.id, reason, duration);

                        message.member.send({ embeds: [banEmbed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ban Appeal').setURL(banStatus[1]))] })
                            .catch(() => console.log(`Couldn\'t DM ${message.member.user.tag} (${message.member.id})`));


                        new Promise(resolve => setTimeout(resolve, 1000));

                        message.member.ban({ reason: reason, deleteMessageSeconds: (60 * 60 * 24 * 7) })

                        channel.send({
                            embeds: [punishEmbed]
                        })
                        // console.log('No ban system yet')
                    } else if (rows[0].punishType === 'kick') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Kicked`)
                            .setDescription(
                                [
                                    `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                                    `> **Channel:** ${message.channel}`,
                                    '',
                                    `> **Message:** ${message.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Kick`,
                                    `> **Duration:** Permanent`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const kickEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Kicked`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        message.member.send({ embeds: [kickEmbed] })
                            .catch(() => console.log(`Couldn\'t DM ${message.member.user.tag} (${message.member.id})`));

                        client.sql.createModLogs("kick", reason, "AutoMod", message.channel.id);
                        client.sql.createPunishLog("kick", reason, "AutoMod", message.member.id, "Permanent");
                        new Promise(resolve => setTimeout(resolve, 1000));

                        message.guild.members.kick(message.member.id, reason)

                        channel.send({
                            embeds: [punishEmbed]
                        })
                    } else if (rows[0].punishType === 'mute') {
                        const muteTime = stringToMilliseconds(duration);

                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Muted`)
                            .setDescription(
                                [
                                    `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                                    `> **Channel:** ${message.channel}`,
                                    '',
                                    `> **Message:** ${message.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Mute`,
                                    `> **Duration:** ${duration}`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const muteEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Muted`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setTimestamp(Date.now())
                            .setFooter(client.footer)

                        message.member.send({ embeds: [muteEmbed] })
                            .catch(() => console.log(`Couldn\'t DM ${message.member.user.tag} (${message.member.id})`));

                        client.sql.createModLogs("mute", reason, "AutoMod", message.channel.id);
                        client.sql.createPunishLog("mute", reason, "AutoMod", message.member.id, duration);

                        message.member.timeout(muteTime, reason)

                        channel.send({
                            embeds: [punishEmbed]
                        })
                    } else if (rows[0].punishType === 'warn') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Warned`)
                            .setDescription(
                                [
                                    `> **User:** <@${message.member.id}> (\`${message.member.id}\`)`,
                                    `> **Channel:** ${message.channel}`,
                                    '',
                                    `> **Message:** ${message.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Warn`,
                                    `> **Duration:** Permanent`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const warnEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Warned`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        channel.send({
                            embeds: [punishEmbed]
                        })

                        message.member.send({ embeds: [warnEmbed] })

                        client.sql.createModLogs("warn", reason, "AutoMod", message.channel.id);
                        client.sql.createPunishLog("warn", reason, "AutoMod", message.member.id, "Permanent");
                    } else if (rows[0].punishType === 'delete') {
                        return;
                    }
                })

                return;
            }
        }
    })
}

/**
 * 
 * @param {import('discord.js').Client} client 
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 * @param {*} text 
 */

const interaction = async (client, interaction, text) => {
    const logChan = interaction.guild.channels.cache.get('AUTOMOD_CHANNEL_ID');
    let blocked = false;
    let autoReason = 'Containing a banned word';
    client.sql.connection.query(`SELECT * FROM bannedWords`, async (err, rows, _) => {
        if (err) throw err;

        const { whitelisted } = require('../dependancies.js');

        const terms = rows.map(row => row.word)
        for (const word of terms) {
            if (whitelisted.includes(word)) return;

            if (text.toLowerCase().includes(word)) {
                blocked = true

                const embed = new EmbedBuilder()
                    .setTitle('Auto Moderation')
                    .setDescription(
                        [
                            `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                            `> **Channel:** ${interaction.channel}`,
                            '',
                            `> **Message:** ${interaction.content}`,
                            `> **Word:** ${word}`,
                            '',
                            `> **Action:** Delete`
                        ].join('\n')
                    )
                    .setTimestamp(Date.now())
                    .setFooter(client.footer)
                    .setColor(0xff0000)

                if (interaction.member.roles.cache.has('STAFF_ROLE_ID')) {
                    embed
                        .setDescription(
                            [
                                `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                                `> **Channel:** ${interaction.channel}`,
                                '',
                                `> **Message:** ${interaction.content}`,
                                `> **Word:** ${word}`
                            ].join('\n')
                        )
                    await logChan.send({
                        embeds: [embed]
                    })
                    return;
                }

                const reason = `(AutoMod) Banned word: ${word}`;

                client.sql.connection.query(`SELECT * FROM bannedWords WHERE word = '${word}'`, async (err, rows, results) => {
                    if (err) throw err;

                    const duration = rows[0].punishTime;

                    if (rows[0].punishType === 'ban') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Banned`)
                            .setDescription(
                                [
                                    `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                                    `> **Channel:** ${interaction.channel}`,
                                    '',
                                    `> **Message:** ${interaction.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Ban`,
                                    `> **Duration:** ${duration || 'Permanent'}`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const banEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Ban`)
                            .setDescription(`> **Reason:** ${reason}\n> **Duration:** ${duration || 'Permanent'}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const banStatus = ban(client, interaction.member.id, "Automod", interaction.channel.id, reason, duration);

                        await interaction.member.send({ embeds: [banEmbed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ban Appeal').setURL(banStatus[1]))] })
                            .catch(() => console.log(`Couldn\'t DM ${interaction.member.user.tag} (${interaction.member.id})`));

                        await new Promise(resolve => setTimeout(resolve, 1000));

                        await interaction.member.ban({ reason: reason })

                        await logChan.send({
                            embeds: [punishEmbed]
                        })
                        autoReason = `Contains potentially harmful content`;
                    } else if (rows[0].punishType === 'kick') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Kicked`)
                            .setDescription(
                                [
                                    `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                                    `> **Channel:** ${interaction.channel}`,
                                    '',
                                    `> **Message:** ${interaction.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Kick`,
                                    `> **Duration:** Permanent`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const kickEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Kicked`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        await interaction.member.send({ embeds: [kickEmbed] })
                            .catch(() => console.log(`Couldn\'t DM ${interaction.member.user.tag} (${interaction.member.id})`));

                        client.sql.createModLogs("kick", reason, "AutoMod", interaction.channel.id);
                        client.sql.createPunishLog("kick", reason, "AutoMod", interaction.member.id, "Permanent");
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        await interaction.guild.members.kick(interaction.member.id, reason)

                        await logChan.send({
                            embeds: [punishEmbed]
                        })
                        autoReason = `Contains content that could come accross as rude or offensive.`
                    } else if (rows[0].punishType === 'mute') {
                        const muteTime = stringToMilliseconds(duration);

                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Muted`)
                            .setDescription(
                                [
                                    `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                                    `> **Channel:** ${interaction.channel}`,
                                    '',
                                    `> **Message:** ${interaction.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Mute`,
                                    `> **Duration:** ${duration}`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const muteEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Muted`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        await interaction.member.send({ embeds: [muteEmbed] })
                            .catch(() => console.log(`Couldn\'t DM ${interaction.member.user.tag} (${interaction.member.id})`));

                        client.sql.createModLogs("mute", reason, "AutoMod", interaction.channel.id);
                        client.sql.createPunishLog("mute", reason, "AutoMod", interaction.member.id, duration);

                        await interaction.member.timeout(muteTime, reason)

                        await logChan.send({
                            embeds: [punishEmbed]
                        })
                        autoReason = `Contains potentially offensive word`;
                    } else if (rows[0].punishType === 'warn') {
                        const punishEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Warned`)
                            .setDescription(
                                [
                                    `> **User:** <@${interaction.member.id}> (\`${interaction.member.id}\`)`,
                                    `> **Channel:** ${interaction.channel}`,
                                    '',
                                    `> **Message:** ${interaction.content}`,
                                    `> **Word:** ${word}`,
                                    '',
                                    `> **Action:** Warn`,
                                    `> **Duration:** Permanent`
                                ].join('\n')
                            )
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        const warnEmbed = new EmbedBuilder()
                            .setTitle(`AutoMod - Warned`)
                            .setDescription(`> **Reason:** ${reason}`)
                            .setColor(0xff0000)
                            .setFooter(client.footer)
                            .setTimestamp(Date.now())

                        await logChan.send({
                            embeds: [punishEmbed]
                        })

                        await interaction.member.send({ embeds: [warnEmbed] })

                        client.sql.createModLogs("warn", reason, "AutoMod", interaction.channel.id);
                        client.sql.createPunishLog("warn", reason, "AutoMod", interaction.member.id, "Permanent");
                        autoReason = `Contains content this server preferes not to have.`;
                    } else if (rows[0].punishType === 'delete') {
                        return;
                    }
                    return;
                })
                return;
            }
        }
    })
}


module.exports = {
    message,
    interaction
};