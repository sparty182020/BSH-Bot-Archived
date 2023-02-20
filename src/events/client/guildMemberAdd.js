const { EmbedBuilder } = require('@discordjs/builders');
const { catchErrors } = require('../../functions/handlers/handleErrors');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // Member Flagging System
        let memberWarning = [0, 0, 0]
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
        // Check if the user joined less than a week after creating their account
        const created = member.user.createdTimestamp;
        const joined = member.joinedTimestamp;
        if (joined - created < 604800000) {
            memberWarning[0] = 1;
            combinedFlags += 1
        }
        // Check if the user joined with an alt account username
        for (const altTerm of altTerms) {
            if (member.user.username.toLowerCase().includes(altTerm)) {
                memberWarning[1] = 1
                combinedFlags += 2
                break;
            };
        }
        // Check if the user joined with a suspicious username
        for (const usernameWarnTerm of usernameWarnTerms) {
            if (member.user.username.toLowerCase().includes(usernameWarnTerm)) {
                memberWarning[2] = 1
                combinedFlags += 4
                break;
            };
        }
        // Check if the user joined with a similar creation date
        // TODO

        if (memberWarning.includes(1)) {
            const notifChannel = client.channels.cache.get('STAFF_ALERT_CHANNEL_ID');

            const flaggingEmbed = new EmbedBuilder()
                .setTitle(`New Member Flagging System`)
                .setThumbnail(member.user.displayAvatarURL())
                .setDescription(`**USER:** ${member.user.tag} (${member.user})\n**ID:** \`${member.id}\``)
                .setColor(0x700000)
                .setFooter(client.footer)
                .setTimestamp();

            // determine which flag to send
            if (memberWarning[0] == 1) flaggingEmbed
                .addFields([
                    {
                        name: 'Flag Notice',
                        value: `New Account (<t:${Math.floor(created / 1000)}:R>)`,
                        inline: true
                    }
                ])
            if (memberWarning[1] == 1) flaggingEmbed
                .addFields([
                    {
                        name: 'Flag Notice',
                        value: `Alt Account`,
                        inline: true
                    }
                ])
            if (memberWarning[2] == 1) flaggingEmbed
                .addFields([
                    {
                        name: 'Flag Notice',
                        value: `Troll-like Username`,
                        inline: true
                    }
                ])

            // send flagging embed
            notifChannel.send({ embeds: [flaggingEmbed] });
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

        // add member to SQL database
        client.sql.connection.query(`SELECT * FROM members WHERE id = '${member.id}'`, async (err, rows) => {
            if (rows.length < 1) {
                client.sql.connection.query('INSERT INTO members (discordId, joinTimestamp, flags) VALUES (?, ?, ?)', [member.id, Math.floor(member.joinedTimestamp / 1000), combinedFlags], (err, rows) => {
                    if (err) throw err;
                })
            } else {
                client.sql.connection.query('UPDATE members SET joinTimestamp = ?, flags = ? WHERE discordId = ?', [Math.floor(member.joinedTimestamp / 1000), combinedFlags, member.id], (err, rows) => {
                    if (err) throw err;
                })
            }
        })

        // bunch of variables
        const genChannel = client.channels.cache.get('GENERAL_CHANNEL_ID');
        const welcomeChannel = client.channels.cache.get('WELCOME_CHANNEL_ID');
        const logChannel = client.channels.cache.get('JOIN_LOG_CHANNEL_ID');
        const role = await member.guild.roles.fetch('MEMBER_ROLE_ID')
            .catch(catchErrors);
        const memberR = await member.guild.members.fetch(member.id).catch(catchErrors);

        // if a known dev alt dotn send welcome messages
        const { alts } = require('../../settings/developers.json')
        if (alts.includes(member.user.id)) return;

        // welcome messages/logs
        const welcomeEmbed = client.embed()
            .setTitle(`Welcome ${member.user.username}!`)
            .setDescription(`Check the rules in <#999263094184366100>\nthen head over to <#999266262054088786> to get your roles!`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFields([
                {
                    name: '_ _',
                    value: `[Invite](https://discord.gg/briansmith) | [TikTok](https://www.tiktok.com/@brian..smith/) | [Website](https://briansmithonline.com/) | [YouTube](https://www.youtube.com/user/latentforce)`
                }
            ])

        const joinLogEmbed = new EmbedBuilder()
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(0x0ff000)
            .setFooter(client.footer)
            .setFields([
                {
                    name: 'User Joined',
                    value: [
                        `> **User:** ${member.user.tag} (<@${member.id}>)`,
                        `> **ID:** \`${member.id}\``,
                        `> **Created:** <t:${Math.floor(new Date(member.user.createdAt) / 1000)}:f>`,
                        `> **Members:** ${member.guild.memberCount}`
                    ].join('\n')
                }
            ])

        genChannel.send(`Everybody welcome <@${member.id}> to the server! We now have **${member.guild.memberCount}** members!`)
        welcomeChannel.send({ embeds: [welcomeEmbed] })
        logChannel.send({ embeds: [joinLogEmbed] })
        member.send(
            [
                `Welcome <@${member.id}>, to ${member.guild.name}!`,
                '',
                `Thank you for joining us and this server's journey.`,
                `Here's how to get started:`,
                '',
                `Learn our rules in <#999263094184366100>`,
                `Get some custom roles in <#999266262054088786>.`,
                '',
                `And chat with the community here <#999266213697945652>!`
            ].join('\n'),
        )
            .catch(() => console.log(`Couldn\'t DM ${member.user.tag} (${member.id})`))

        await memberR.roles.add(role);
    }
}