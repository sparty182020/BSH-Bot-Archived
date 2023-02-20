const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The warn reason').setRequired(true)),
    info: {
        description: 'Officially warn a member',
        usage: '/warn <member> <reason>',
        type: 'moderation'
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {*} client 
     * @returns 
     */
    async execute(interaction, client) {
        const member = interaction.options.getUser('member');
        const staff = interaction.member;
        const reason = interaction.options.getString('reason');

        if (interaction.options.getMember('member').roles.cache.has("1004426132667498666") && !interaction.member.roles.cache.has('1005062762919120977')) return interaction.reply({ content: ':x: You cannot mute this member', ephemeral: true });
        if (member.id === staff.id) return interaction.reply({ content: ':x: You cannot warn yourself', ephemeral: true });

        client.sql.createPunishLog("warn", reason, staff.id, member.id, "Permanent");
        client.sql.createModLogs("warn", reason, staff.id, member.id);

        const staffEmbed = new EmbedBuilder()
            .setDescription(`${require('../../settings/emojis.json').badges.green} **Warned ${member.tag}**\n> **Reason**: ${reason}`)
            .setColor(client.color)

        const embed = new EmbedBuilder()
            .setTitle(`Warned`)
            .setDescription(`> **Reason:** ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `${interaction.user.tag} | ${client.footer.text}`
            })
        
        await interaction.reply({
            embeds: [staffEmbed],
        })

        await member.send({ embeds: [embed] })
            .catch(() => console.log(`Couldn\'t DM ${member.tag} (${member.id})`))
            
        client.sql.connection.query(`SELECT logId FROM punishLogs WHERE staffId = '${staff.id}' AND offenderId = '${member.id}' ORDER BY logId DESC LIMIT 1`, async (err, rows) => {
            if (err) throw err;
            const caseId = rows[0].logId;

            const logEmbed = new EmbedBuilder()
                .setTitle(`Warn | ${caseId}`)
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