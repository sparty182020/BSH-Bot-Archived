const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { catchErrors } = require('../../functions/handlers/handleErrors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketblacklist')
        .setDescription('Adds/Removes a member from ticket blacklist')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to (un)blacklist').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for (un)blacklisting the member').setRequired(false)),
    info: {
        description: 'Add/Remove a member from ticket blacklist to deny/allow them making tickets',
        usage: '/ticketblacklist <member> [reason]',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const { roles } = interaction.member
        const role = await interaction.guild.roles.fetch('1051594743852826655').catch(catchErrors);
        const member = interaction.options.getUser('member');
        // if reason is set then use it, if not then use the default reason
        const reason = interaction.options.getString('reason') || 'No reason provided';

        client.sql.connection.query(`SELECT ticketBlacklist FROM settings WHERE discordId = ${interaction.user.id}`, async (err, rows, results) => {
            if (err) throw err;

            if (rows[0].ticketBlacklist === 0) {
                const addEmbed = new EmbedBuilder()
                    .setTitle('Ticket Blacklist')
                    .setDescription(`You have been blacklisted from making tickets in **${interaction.guild.name}**.`)
                    .setThumbnail(member.displayAvatarURL())
                    .setColor(client.color)
                    .setFields([
                        {
                            name: 'Reason',
                            value: `${reason}`
                        },
                        {
                            name: 'Common Reasons',
                            value: '- Spamming tickets\n- Disrespecting staff in tickets\n- Being a troll'
                        }
                    ])
                    .setFooter({
                        text: `Blacklisted by ${interaction.user.tag} | ${client.footer.text}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });
                
                client.sql.connection.query(`UPDATE settings SET ticketBlacklist = 1 WHERE discordId = ${member.id}`, (err, rows) => {
                    if (err) throw err;
                })

                await interaction.reply({
                    content: `${require('../../settings/emojis.json').badges.green} You have added <@${member.id}> to the ticket blacklist.`,
                })
                await member.send({ embeds: [addEmbed] })
            } else {
                const removeEmbed = new EmbedBuilder()
                    .setTitle('Ticket Blacklist')
                    .setDescription(`You have been unblacklisted from making tickets in **${interaction.guild.name}**.\nMake sure you are following the rules and being careful next time.`)
                    .setThumbnail(member.displayAvatarURL())
                    .setColor(client.color)
                    .setFooter({
                        text: `Unblacklisted by ${interaction.user.tag} | ${client.footer.text}`,
                        iconURL: interaction.user.displayAvatarURL(),
                    });
                
                client.sql.connection.query(`UPDATE settings SET ticketBlacklist = 1 WHERE discordId = ${member.id}`, (err, rows) => {
                    if (err) throw err;
                })
                
                await interaction.reply({
                    content: `${require('../../settings/emojis.json').badges.green} You have removed <@${member.id}> from the ticket blacklist. **Reason:** ${reason}`,
                })
                await member.send({ embeds: [removeEmbed] })
            }
        })
    }
}