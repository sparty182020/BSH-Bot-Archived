const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memberinfo')
        .setDescription('Returns info about specified member')
        .addUserOption(option => option.setName('user').setDescription('The user to get information about').setRequired(true)),
    info: {
        description: 'Get some information about a member of the server',
        usage: '/memberinfo',
        type: 'utility'
    },
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const member = interaction.options.getMember('user');

        const userEmbed = client.embed()
            .setTitle(user.tag)
            .setThumbnail(user.displayAvatarURL())
            .addFields([
                {
                    name: '_ _',
                    value: `**User ID:** \`${user.id}\`\n**Joined Discord:** <t:${Math.floor(user.createdTimestamp / 1000)}:f>\n**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:f>`,
                    inline: false
                },
                {
                    name: `Roles [${member.roles.cache.size}]`,
                    value: `${member.roles.cache.map(role => role.toString()).join(' ')}\n`,
                    inline: true
                },
                {
                    name: 'Noticable Roles',
                    value: `${member.roles.highest}`,
                    inline: true
                },
            ]);

        client.sql.connection.query(`SELECT flags FROM members WHERE discordId = '${user.id}'`, async (error, results, rows) => {
            if (error) throw error;
            
            let { flags } = results[0] || { flags: 0 };

            const flagList = {
                0: 'None',
                1: 'New Account',
                2: 'Alt Account',
                3: 'New + Alt Account',
                4: 'Troll-like Username',
                5: 'New + Troll-like Username',
                6: 'Alt + Troll-like Username',
                7: 'New + Alt + Troll-like Username'
            }

            if (interaction.member.roles.cache.has('1004426132667498666')) userEmbed.addFields(
                {
                    name: 'Flags',
                    value: `Value: ${flags}\nMeaning: ${flagList[flags]}`,
                    inline: true
                }
            );
            await interaction.reply({
                embeds: [userEmbed]
            })
        })
    }
}