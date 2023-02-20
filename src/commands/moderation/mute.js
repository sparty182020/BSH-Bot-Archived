const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        .setName('mute')
        .setDescription('Mute a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the mute').setRequired(false)),
    info: {
        description: 'Mute and stop a member from talking',
        usage: '/mute <user> <duration> <reason>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('user')
        const reason = interaction.options.getString('reason') || 'No reason provided'
        const time = stringToMilliseconds(interaction.options.getString('duration'))
        const staff = interaction.user

        if (interaction.options.getMember('user').roles.cache.has("1004426132667498666") && !interaction.member.roles.cache.has('1005062762919120977')) return interaction.reply({ content: ':x: You cannot mute this member', ephemeral: true });
        if (member.id === staff.id) return interaction.reply({ content: ':x: You cannot mute yourself', ephemeral: true });

        if (time === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`:x: Invalid duration`)
                .setDescription(`Invalid time format\nTry: \`w\`, \`d\`, \`h\`, \`m\`, \`s\``)
                .setColor(client.color)

            await interaction.reply({ embeds: [embed] });
            return;
        }

        await interaction.options.getMember('user').timeout(
            time,
            reason
        )

        client.sql.createModLogs("mute", reason, interaction.member.id, interaction.channel.id);
        client.sql.createPunishLog("mute", reason, interaction.member.id, member.id, interaction.options.getString('duration'));

        const embed = new EmbedBuilder()
            .setTitle(`${require('../../settings/emojis.json').badges.green} Muted ${member.tag}`)
            .setDescription(`**Duration**: ${interaction.options.getString('duration')}\n**Reason**: ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())

        const userEmbed = new EmbedBuilder()
            .setTitle(`:interrobang: You have been muted in ${interaction.guild.name}`)
            .setDescription(`> **Duration:** ${interaction.options.getString('duration')}\n> **Reason:** ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `${interaction.user.tag} | ${client.footer.text}`
            })

        await interaction.reply({ embeds: [embed] });
        await member.send({ embeds: [userEmbed] })
            .catch(() => console.log(`Could not send a DM to ${member.tag}`));

        client.sql.connection.query(`SELECT logId FROM punishLogs WHERE staffId = '${staff.id}' AND offenderId = '${member.id}' ORDER BY logId DESC LIMIT 1`, async (err, rows) => {
            if (err) throw err;
            const caseId = rows[0].logId;

            const logEmbed = new EmbedBuilder()
                .setTitle(`Mute | ${caseId}`)
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