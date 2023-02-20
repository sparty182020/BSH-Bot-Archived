const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The kick reason').setRequired(false)),
    info: {
        description: 'Kick a member from the server',
        usage: '/kick <user> [reason]',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || "No Reason Provided";

        if (interaction.options.getMember('user').roles.cache.has("1004426132667498666") && !interaction.member.roles.cache.has('1005062762919120977')) return interaction.reply({ content: ':x: You cannot mute this member', ephemeral: true });
        if (member.id === interaction.user.id) return interaction.reply({ content: ':x: You cannot kick yourself', ephemeral: true });

        if (member.id == interaction.user.id) return await interaction.reply({
                content: `You can't kick yourself!`
            });

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${require('../../settings/emojis.json').badges.green} ${member.tag} Kicked`)
            .setDescription(`**${member.tag}** kicked!\n**Reason:** ${reason}`)

        const kickEmbed = new EmbedBuilder()
            .setTitle(`Kicked`)
            .setDescription(`> **Reason:** ${reason}`)
            .setColor(client.color)
            .setTimestamp(Date.now())
            .setFooter({
                iconURL: interaction.user.displayAvatarURL(),
                text: `${interaction.user.tag} | ${client.footer.text}`
            })

        await member.send({ embeds: [kickEmbed] })
            .catch(_ => console.log(`Couldn\'t DM ${member.tag} (${member.id})`));

        client.sql.createModLogs("kick", reason, interaction.member.id, interaction.channel.id);
        client.sql.createPunishLog("kick", reason, interaction.member.id, member.id, "Permanent");
        await interaction.reply({ embeds: [embed] });

        await delay(1000);

        await interaction.guild.members.kick(member.id, reason)
            .catch(_ => interaction.reply({ content: `I couldn\'t kick ${member.tag}!`, ephemeral: true }));
        
        client.sql.connection.query(`SELECT logId FROM punishLogs WHERE staffId = '${interaction.user.id}' AND offenderId = '${member.id}' ORDER BY logId DESC LIMIT 1`, async (err, rows) => {
            if (err) throw err;
            const caseId = rows[0].logId;

            const logEmbed = new EmbedBuilder()
                .setTitle(`Kick | ${caseId}`)
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