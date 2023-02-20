const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

function stringToMilliseconds(timeString) {
    const time = timeString.split(' ');
    let milliseconds = 0;
    for (let i = 0; i < time.length; i++) {
        const unit = time[i].slice(-1);
        const amount = time[i].slice(0, -1);
        switch (unit) {
            case 'w':
                milliseconds += amount * 604800000;
                break;
            case 'd':
                milliseconds += amount * 86400000;
                break;
            case 'h':
                milliseconds += amount * 3600000;
                break;
            case 'm':
                milliseconds += amount * 60000;
                break;
            case 's':
                milliseconds += amount * 1000;
                break;
            default:
                milliseconds = 0;
        }
    }
    return milliseconds;
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest something for the server')
        .addStringOption(option =>
            option
                .setName('suggestion')
                .setDescription('The suggestion')
                .setRequired(true)
        ),
    info: {
        description: 'Suggest something towards the development of the server or bot',
        usage: '/suggest <suggestion>',
        type: 'utility'
    },
    async execute(interaction, client) {
        const suggestion = interaction.options.getString('suggestion');
        const channel = client.channels.cache.get('SUGGESTION_APPROVAL_CHANNEL_ID');
        const logChan = client.channels.cache.get('AUTOMOD_LOG_CHANNEL_ID');
        let blocked = false;
        let autoReason = 'Containing a banned word';

        client.sql.connection.query(`SELECT * FROM bannedWords`, async (err, rows, results) => {
            if (err) throw err;

            const terms = rows.map(row => row.word)
            for (const word of terms) {
                if (suggestion.toLowerCase().includes(word)) {
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

                            await interaction.member.send({ embeds: [banEmbed] })
                                .catch(() => console.log(`Couldn\'t DM ${interaction.member.user.tag} (${interaction.member.id})`));

                            client.sql.createModLogs("ban", reason, "AutoMod", interaction.channel.id);
                            if (duration == null || duration == "Permanent") {
                                client.sql.createPunishLog("ban", reason, "AutoMod", interaction.member.id, "Permanent");
                            } else {
                                client.sql.createPunishLog("temp ban", reason, "AutoMod", interaction.member.id, duration, Math.floor((Date.now() + stringToMilliseconds(duration)) / 1000));
                            }
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

        client.sql.connection.query(`SELECT suggestionBlacklist FROM settings WHERE discordId = '${interaction.user.id}'`, async (err, rows) => {
            if (err) throw err;

            if (rows.length < 1) {
                return;
            }

            if (rows[0].suggestionBlacklist === 1) {
                blocked = true;
                autoReason = `User is blacklisted from suggesting.`;
                return;
            }

            return
        })

        await new Promise(resolve => setTimeout(resolve, 2000));

        const suggestionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const suggestionEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag} suggested:`,
                iconUrl: interaction.user.displayAvatarURL()
            })
            .setDescription(suggestion)
            .addFields([
                {
                    name: 'Status',
                    value: '\`PENDING APPROVAL\`',
                }
            ])
            .setTimestamp()
            .setColor(0xffa500)
            .setFooter({
                text: `Suggestion ID: ${suggestionId}`
            })
            

        const approve = new ButtonBuilder()
            .setCustomId('approveSuggestion')
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success)
        
        const deny = new ButtonBuilder()
            .setCustomId('denySuggestion')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger)
        
        const blacklist = new ButtonBuilder()
            .setCustomId('blacklistSuggestee')
            .setLabel('Blacklist Suggestee')
            .setStyle(ButtonStyle.Danger)

        if (blocked === false) {
            await interaction.reply({ content: `Your suggestion has been sent to staff for manual review. Before it will be approved or denied to be publicised.`, ephemeral: true })
            channel.send({
                embeds: [suggestionEmbed],
                components: [
                    new ActionRowBuilder()
                        .addComponents([approve, deny, blacklist])
                ],
            }).then(async msg => {
                const suggestionData = {
                    suggestionId: suggestionId,
                    userId: interaction.user.id,
                    status: 'pending approval',
                    messageId: msg.id,
                    suggestion: suggestion
                }

                client.sql.connection.query(`INSERT INTO suggestions SET ?`, suggestionData, async (err, rows) => {
                    if (err) throw err;

                    console.log(`Suggestion added to database: ${suggestionId}`);
                });
            });
        } else {
            await interaction.reply({ content: `Your message has been blocked due to reason: ${autoReason}.`, ephemeral: true })
        }
    }
}