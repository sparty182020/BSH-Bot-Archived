const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
        .setName('ban')
        .setDescription('Ban a member (Perma ban - No temp yet)')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The ban reason').setRequired(false))
        .addStringOption(option => option.setName('duration').setDescription('The ban duration (use w,d,h,m,s format) eg. 1w 3d 12h = 1 week, 3 days, and a 12 hours').setRequired(false)),
    info: {
        description: 'Ban a member from the server',
        usage: '/ban <member> <reason> <duration>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('member');
        const staff = interaction.member;
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const duration = interaction.options.getString('duration') || 'Permanent';

        if (interaction.options.getMember('member').roles.cache.has("1004426132667498666") && !interaction.member.roles.cache.has('1005062762919120977')) return interaction.reply({ content: ':x: You cannot ban this member', ephemeral: true });
        if (member.id === staff.id) return interaction.reply({ content: ':x: You cannot ban yourself', ephemeral: true });

        const banStatus = require('../../internalSRC/ban')(client, member.id, staff.id, interaction.channel.id, reason, duration)

        if (!banStatus[0]) {
            return interaction.reply({ content: banStatus[1], ephemeral: true })
        }

        const staffEmbed = new EmbedBuilder()
            .setFields([
                {
                    name: `${require('../../settings/emojis.json').badges.green} ${member.tag} banned`,
                    value: `> **Reason**: ${reason}\n> **Duration:** ${interaction.options.getString('duration') || 'Permanent'}`
                }
            ])
            .setColor(client.color)

        const embed = new EmbedBuilder()
            .setTitle(`Banned`)
            .setDescription(`> **Reason:** ${reason}\n> **Duration:** ${interaction.options.getString('duration') || 'Permanent'}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `${interaction.user.tag} | ${client.footer.text}`
            })

        await interaction.reply({
            embeds: [staffEmbed],
        })

        await member.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Ban Appeal').setURL(banStatus[1]))] })
            .catch(() => console.log(`Couldn\'t DM ${member.tag} (${member.id})`))
        
        await interaction.guild.members.ban(member.id, { deleteMessageSeconds: 60 * 60 * 24, reason: reason })

        client.sql.connection.query(`SELECT logId FROM punishLogs WHERE staffId = '${staff.id}' AND offenderId = '${member.id}' ORDER BY logId DESC LIMIT 1`, async (err, rows) => {
            if (err) throw err;
            const caseId = rows[0].logId;

            const logEmbed = new EmbedBuilder()
                .setTitle(`Ban | ${caseId}`)
                .setDescription(`> **Member:** ${member.tag} (${member.id})\n> **Reason:** ${reason}`)
                .setColor(client.color)
                .setTimestamp(Date.now())
                .setFooter({
                    text: `${interaction.user.tag} | ${client.footer.text}`,
                    iconURL: interaction.member.displayAvatarURL()
                })
                .setThumbnail(member.displayAvatarURL());
        
            const channel = client.channels.cache.get('1008315793806737509');
            await channel.send({ embeds: [logEmbed] })
        });
    },
};