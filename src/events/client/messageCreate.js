const { EmbedBuilder } = require('@discordjs/builders');
const { AttachmentBuilder } = require('discord.js');
const { catchErrors } = require('../../functions/handlers/handleErrors');
const Canvas = require('@napi-rs/canvas');
const { join } = require('path');

module.exports = {
    name: 'messageCreate',
    /**
     * @param {import('discord.js').Message} message
     * @param {import('discord.js').Client} client
     */
    async execute(message, client) {
        try {
            // detecting if member sent a DM
            if (!message.guild) {
                if (message.author.bot) return;
                const content = message.content.toLowerCase();
                const chan = client.guilds.cache.get('GUILD_ID')
                    .channels.cache.get('DM_LOG_CHANNEL_ID')
                await chan.send({
                    content: `DM from (\`${message.author.id}\`) ${message.author.tag}: ${message.content}`,
                })
                if (!content.includes('help') && !content.includes('support')) return;
                // if message contains 'help' or 'support'
                const dmEmbed = client.embed()
                    .setTitle(`Support`)
                    .setDescription(`If you are looking for support please head over to out support channel and create a ticket <#1000806050536108162>. `)
                await message.channel.send({ embeds: [dmEmbed] });
                console.log(`DM from ${message.author.tag}: ${message.content}`);
                return;
            }

            client.sql.connection.query('SELECT * FROM members WHERE discordId = ?', [message.author.id], async (err, rows, results) => {
                if (message.author.bot || message.webhookId || message.system) return;
                if (err) throw err;

                let combinedFlags = 0
                const usernameWarnTerms = [
                    'kanye',
                    'hitler',
                    'tate'
                ];
                const altTerms = [
                    'alt',
                    'alt account',
                    'altaccount',
                    'alt-account',
                    'altacc',
                    'alt-acc',
                    'two',
                    'three',
                    'second',
                    'third',
                    '2nd',
                    '3rd',
                    '2nd account',
                    '3rd account',
                    '2nd-account',
                    '3rd-account',
                    '2ndacc',
                    '3rdacc',
                    '2nd-acc',
                    '3rd-acc',
                    '2ndaccount',
                    '3rdaccount',
                ];
                const created = message.author.createdTimestamp;
                const joined = message.member.joinedTimestamp;
                if (joined - created < 604800000) { combinedFlags += 1 }
                for (const altTerm of altTerms) {
                    if (message.member.nickname?.toLowerCase().includes(altTerm) || message.author.username.toLowerCase().includes(altTerm)) {
                        combinedFlags += 2
                        break;
                    };
                }
                for (const usernameWarnTerm of usernameWarnTerms) {
                    if (message.member.nickname?.toLowerCase().includes(usernameWarnTerm) || message.author.username.toLowerCase().includes(usernameWarnTerm)) {
                        combinedFlags += 4
                        break;
                    };
                }

                /*
                Flag Values:
                0: none
                1: new
                2: username
                3: new + username
                4: alt
                5: username + alt
                6: new + alt
                7: new + username + alt
                */

                if (!rows[0]) {
                    return client.sql.connection.query('INSERT INTO members (discordId, joinTimestamp, flags) VALUES (?, ?, ?)', [message.author.id, Math.floor(message.member.joinedTimestamp / 1000), combinedFlags], (err, rows) => {
                        if (err) throw err;
                    })
                }

                client.sql.connection.query('UPDATE members SET flags = ? WHERE discordId = ?', [combinedFlags, message.author.id], (err, rows) => {
                    if (err) throw err;
                })
            })


            if (message.author.bot) return
            if (message.attachments.size > 0) return;

            // checxking if user is in settings database
            client.sql.connection.query(`SELECT * FROM settings`, (err, rows, results) => {
                if (rows.length < 1) return;

                const user = []

                for (let i = 0; i < rows.length; i++) user.push(rows[i].discordId);

                if (!user.includes(message.author.id)) {
                    // if not add them
                    client.sql.connection.query(`INSERT INTO settings (discordId, levelPing, openDM, ticketBlacklist) VALUES (${message.author.id}, 1, 1, 0)`, (err, rows) => {
                        if (err) throw err;

                        console.log(`Added ${message.author.tag} to the database`)
                    })
                }
            })

            // fun - if Ovoid says "brian protection" says stuff
            if (message.content.toLowerCase().includes('brian protection') && message.author.id === '564360797996843018') {
                message.reply({
                    content: 'Brian protection is a scam, Brian\'s Protector is the real deal',
                })
            }
            // fun - dead chat response
            if (message.content.toLowerCase().includes('dead chat')) {
                await message.react('👀')
                await message.reply({
                    content: 'Dead chat? I\'m not dead, I\'m just sleeping',
                })
            }
            // fun - reacte with moyai on bonlong's messages
            // if (message.author.id === '505458216474378271') {
            //     await message.react('🗿')
            // }

            // bot staff [staff name]
            if (message.content.toLowerCase().startsWith('bot')) {
                const commandSegments = message.content.toLowerCase().split(' ');
                commandSegments.shift();
                const command = commandSegments.shift();
                const args = commandSegments;
                switch (command) {
                    case 'staff':
                        const staff = args[0];
                        await fetch(`https://bsh.daad.wtf/api/staff/${staff}`)
                            .then(res => {
                                if (res.status !== 400 && res.status !== 404) return res.json();
                                return interaction.reply('Invalid user');
                            })
                            .then(async res => {
                                if (res) await message.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setTitle(`Details on ${res.name}`)
                                            .setDescription(
                                                [
                                                    `>>> **Name:** ${res.name}`,
                                                    `**Role:** ${res.role}`,
                                                    `**Bio:** ${res.bio || "None Provided"}`,
                                                    `**Favorite Color:** ${res.favs.color.name || "None Provided"}`,
                                                    `**Favorite Food:** ${res.favs.food || "None Provided"}`,
                                                    `**Favorite Book:** ${res.favs.book || "None Provided"}`,
                                                    `**Favorite TV Show / Movie:** ${res.favs.tv || "None Provided"}`,
                                                    `**Favorite Game:** ${res.favs.game || "None Provided"}`,
                                                    `**Notable Contributions:** ${res['notable-contribs']}`
                                                ].join('\n')
                                            )
                                            .setTimestamp(Date.now())
                                            .setColor(parseInt(res.favs.color.dec, 10))
                                            .setThumbnail(`https://bsh.daad.wtf/api/user/${res.id}/avatar`)
                                            .setFooter(client.footer)
                                    ]
                                })
                            })
                }
            }

            // logging message to database
            const msgTimestamp = Math.floor(message.createdTimestamp / 1000);

            const logData = {
                messageId: message.id,
                channelId: message.channel.id,
                userId: message.author.id,
                content: message.content.replace('\'', " "),
                timestamp: msgTimestamp,
            };
            client.sql.connection.query(
                "INSERT INTO messageLogs SET ?",
                logData
            );

            // running message through automod
            client.automod.message(client, message);

            // running leveling system
            client.sql.connection.query(`SELECT * FROM levels WHERE discordId = '${message.author.id}'`, async (err, rows) => {
                if (err) throw err;

                if (rows.length < 1) return client.sql.connection.query(`INSERT INTO levels (discordId, username, level, xp) VALUES ('${message.author.id}', '${message.author.username}', 1, 0)`);

                let xp = parseInt(rows[0].xp);
                let level = parseInt(rows[0].level);
                let xpNeeded = 100 * level + 75;

                function calculateMultiplier() {
                    let multi = 1;
                    multi *= Math.min(Math.max(message.content.replace(/[^ \!"#$%&'\(\)\*\+,\-\.\/0-9\:\;<\=>\?@A-Z\[\\\]\^\_a-z\{\|\}~]/gmi, '').length / 40, 1), 4)
                    if (message.member.premiumSince) multi *= 1.5
                    if (new Date().getDay() === 0 || new Date().getDay() === 6) multi *= 1.25
                    return multi
                }

                xp += Math.round(Math.random() * calculateMultiplier() * 15);

                const oldLevel = parseInt(rows[0].level);

                while (xpNeeded <= xp) {
                    level++;
                    xp -= xpNeeded;
                    xpNeeded = 100 * level + 75;
                }
                if (level !== oldLevel) {
                    Canvas.GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'assets', 'fonts', 'Cubano.ttf'), 'Cubano')

                    const levelChannel = message.guild.channels.cache.get('LEVEL_UP_CHANNEL_ID');

                    async function provideRoles(member, level) {
                        // INSERT ROLES HERE
                    }

                    provideRoles(message.member, level);

                    const canvas = Canvas.createCanvas(860, 300);
                    const context = canvas.getContext('2d');
                    context.fillStyle = "#1D1E22"
                    context.rect(0, 0, canvas.width, canvas.height);
                    context.fill();
                    context.font = '40px Cubano';
                    context.fillStyle = '#ffffff';
                    context.fillText(
                        message.author.username.replace(/[^ #'\*\-\.0-9A-Z\_a-z]/gmi, ''),
                        canvas.width / 2.5 - 30,
                        canvas.height / 3.5
                    );
                    context.font = '34px Cubano'
                    context.fillStyle = '#ffffff';
                    context.fillText(
                        `LEVEL UP`,
                        canvas.width / 2.5 - 30,
                        canvas.height / 1.8
                    );
                    context.font = '34px Cubano'
                    context.fillStyle = '#ffffff';
                    context.fillText(
                        `LEVEL ${oldLevel} - ${level}`,
                        canvas.width / 2.5 - 30,
                        canvas.height / 1.3
                    );
                    context.beginPath();
                    context.arc(150, 150, 128, 0, Math.PI * 2, true);
                    context.closePath();
                    context.clip();
                    const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ extension: 'jpg', size: 256, dynamic: true }));
                    context.drawImage(avatar, 22, 22, 256, 256);

                    const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'profile-image.jpg' });

                    client.sql.connection.query(`SELECT levelPing FROM settings WHERE discordId = '${message.author.id}'`, (err, results, rows) => {
                        if (err) throw err;

                        levelChannel.send({
                            content: Boolean(results[0].levelPing) ? `<@${message.author.id}>` : '',
                            files: [attachment]
                        })
                    })
                }

                client.sql.connection.query(`UPDATE levels SET xp = ${xp}, level = ${level}, username = '${message.author.username}' WHERE discordId = '${message.author.id}'`)
            })
        } catch (e) {
            catchErrors(e)
        }
    }
}