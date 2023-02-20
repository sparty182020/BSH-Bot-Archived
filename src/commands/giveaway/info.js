const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('g-info')
        .setDescription('Get info about a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option.setName('giveawayid').setDescription('The id of the giveaway').setRequired(true)),
    info: {
        description: 'Used to get info about a giveaway',
        usage: '/g-info <giveawayid>',
        type: 'events'
    },
    async execute(interaction, client) {
        const giveawayId = interaction.options.getString('giveawayid');

        client.sql.connection.query(`SELECT * FROM giveaways WHERE giveawayId = '${giveawayId}'`, async function (err, results, fields) {
            if (err) return;

            const embed = new EmbedBuilder()
                .setTitle(`Giveaway Info for ${giveawayId}`)
                .setDescription(`**Prize:** ${results[0].prize}\n**Host:** <@${results[0].hostId}> (\`${results[0].hostId}\`)\n**Message ID:** ${results[0].messageId}\n**End Time:** <t:${results[0].endTime}:R>\n**Winner:** <@${results[0].winner || "No winner"}>`)
                .setColor(client.color)
                .setTimestamp()
                .setFooter({
                    text: `Giveaway ID: ${giveawayId}`,
                })
            
                await interaction.reply({
                    embeds: [embed],
                })
        })
    }
}