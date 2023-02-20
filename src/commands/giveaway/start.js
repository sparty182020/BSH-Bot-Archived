const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

function stringToMilliseconds(timeString) {
    const time = timeString.split(' ');
    let milliseconds = 0;
    for (let i = 0; i < time.length; i++) {
        const unit = time[i].slice(-1);
        const amount = time[i].slice(0, -1);
        switch (unit) {
            case 'd':
                milliseconds += amount * 86400000;
                break;
            case 'h':
                milliseconds += amount * 3600000;
                break;
            case 'm':
                milliseconds += amount * 60000;
                break;
        }
    }
    return milliseconds;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('g-start')
        .setDescription('Create a new giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('prize').setDescription('The prize of the giveaway').setRequired(true))
        .addStringOption(option => option.setName('duration').setDescription('The duration of the giveaway (d or h)').setRequired(true)),
    info: {
        description: 'Start a new giveaway',
        usage: '/g-start <prize> <duration>',
        type: 'events'
    },
    async execute(interaction, client) {
        const giveawayID = Math.floor(Math.random() * 10000000);
        const prize = interaction.options.getString('prize');
        const gChannel = interaction.guild.channels.cache.get('1034486240235503748');
        const time = stringToMilliseconds(interaction.options.getString('duration'));

        client.sql.connection.query(`CREATE TABLE giveaway${giveawayID} (memberId varchar(1500))`)

        const dataT = {
            memberId: interaction.user.id,
        }

        client.sql.connection.query(`INSERT INTO giveaway${giveawayID} SET ?`, dataT)

        await interaction.reply({
            content: `${require('../../settings/emojis.json').badges.green} Sent giveaway to ${gChannel}`,
            ephemeral: true,
        });

        const UnixTimeEnd = Math.floor((Date.now() + time) / 1000);

        const enter = new ButtonBuilder()
            .setCustomId(`enterGiveaway`)
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Secondary);

        const embed = new EmbedBuilder()
            .setTitle(`${prize}`)
            .setDescription(`**Ends:** <t:${UnixTimeEnd}:R>\n**Hosted by:** <@${interaction.user.id}>\n\nClick the button below to enter the giveaway <:tada:1069149185766604900>`)
            .setColor(client.color)
            .setFooter({
                text: `Giveaway ID: ${giveawayID}`,
            })
            .setTimestamp(Date.now())
        
        const sent = await gChannel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(enter)],
        })

        const messageId = sent.id;

        const data = {
            giveawayId: giveawayID,
            prize: prize,
            channelId: gChannel.id,
            messageId: messageId,
            endTime: UnixTimeEnd,
            hostId: interaction.user.id,
            ended: 0,
        }

        client.sql.connection.query(`INSERT INTO giveaways SET ?`, data, (err, res) => {
            if (err) throw err;
            console.log(`Giveaway '${giveawayID}' created`);
        })
    }
}