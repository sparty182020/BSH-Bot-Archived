const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('g-reroll')
        .setDescription('Reroll a giveaway winner')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('giveawayid').setDescription('The id of the giveaway').setRequired(true)),
    info: {
        description: 'Reroll a giveaway to get a new winner',
        usage: '/g-reroll <giveawayid>',
        type: 'events'
    },
    async execute(interaction, client) {
        const giveawayId = interaction.options.getString('giveawayid');

        client.sql.connection.query(`SELECT * FROM giveaways WHERE giveawayId = '${giveawayId}'`, async function (err, results, fields) {
            if (err) return;

            const channel = interaction.guild.channels.cache.get(results[0].channelId);

            if (results[0].ended != 1) {
                await interaction.reply({
                    content: `The giveaway has not ended yet.`,
                    ephemeral: true,
                });
            } else {
                client.sql.connection.query(`UPDATE giveaways SET ended = 1 WHERE giveawayId = '${giveawayId}'`)
                client.sql.connection.query(`SELECT * FROM giveaway${giveawayId} ORDER BY RAND() LIMIT 1;`, async function (err, results, fields) {
                    if (err) return;

                    const winner = results[0].memberId;
                    client.sql.connection.query(`UPDATE giveaways SET winner = ? WHERE giveawayId = '${giveawayId}'`, winner)
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
                client.sql.connection.query(`SELECT * FROM giveaways WHERE giveawayId = '${giveawayId}'`, async function (err, results, fields) {
                    if (err) return;

                    const channel = interaction.guild.channels.cache.get(results[0].channelId);
                    const msg = await channel.messages.fetch(results[0].messageId);

                    const endTimestamp = Math.floor(results[0].endTime);
                    const host = results[0].hostId;

                    const embed = new EmbedBuilder()
                        .setTitle(`${results[0].prize}`)
                        .setDescription(`**Ended:** <t:${endTimestamp}:R>\n**Hosted By:** <@${host}>\n**Winner:** <@${results[0].winner}>`)
                        .setColor(0x0f00)
                        .setTimestamp()
                        .setFooter({
                            text: `Giveaway ID: ${results[0].giveawayId}`,
                        })
                    
                    const button = new ButtonBuilder()
                        .setCustomId(`${results[0].giveawayId}}`)
                        .setEmoji('🎉')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);
                    
                    await msg.edit({
                        embeds: [embed],
                        components: [new ActionRowBuilder().addComponents(button)],
                    })

                    await interaction.reply({
                        content: `${require('../../settings/emojis.json').badges.green} Rerolling giveaway...`,
                        ephemeral: true,
                    })
    
                    await channel.send({
                        content: `Giveaway was rerolled. <@${results[0].winner}> won the giveaway for **${results[0].prize}**!`
                    })
                })
            }
        })
    }
}