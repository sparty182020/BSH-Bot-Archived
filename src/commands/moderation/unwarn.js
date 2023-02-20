const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Unwarn a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('member').setDescription('The member to unwarn').setRequired(true))
        .addIntegerOption(option => option.setName('id').setDescription('The case ID').setRequired(true)),
    info: {
        description: 'Remove a warn from a member specified by the case ID',
        usage: '/unwarn <member> <id>',
        type: 'moderation'
    },
    async execute(interaction, client) {
        const member = interaction.options.getUser('member');
        const staff = interaction.member;
        const caseID = interaction.options.getInteger('id');

        if (member.id === staff.id) return interaction.reply({ content: 'You can\'t unwarn yourself.', ephemeral: true });

        client.sql.createModLogs("unwarn", null, staff.id, interaction.channel.id);

        const staffEmbed = new EmbedBuilder()
            .setFields([
                {
                    name: `${require('../../settings/emojis.json').badges.green} ${member.tag} unwarned`,
                    value: `> Case ID: ${caseID}`
                }
            ])
            .setColor(client.color)

        client.sql.connection.query(`SELECT * FROM punishLogs WHERE logType = 'warn'`, async (err, results, rows) => {
            if (err) throw err;

            const warns = [];

            results.forEach(result => warns.push(result.logId))

            if (warns.includes(caseID)) {
                client.sql.connection.query(`UPDATE punishLogs SET logType = 'deleted warn' WHERE logId = ${caseID}`, async (err, results, rows) => {
                    if (err) throw err;
                })

                await interaction.reply({
                    embeds: [staffEmbed],
                })

                const userEmbed = new EmbedBuilder()
                    .setTitle(`Unwarned`)
                    .setDescription(`> **Case:** ${caseID}\n> Warn removed by **${staff.user.tag}**`)
                    .setColor(client.color)
                    .setTimestamp(Date.now())

                await member.send({ embeds: [userEmbed] })
                    .catch(() => console.log(`Couldn\'t DM ${member.tag} (${member.id})`))
                
                    const logEmbed = new EmbedBuilder()
                    .setTitle(`Unwarn | ${caseID}`)
                    .setDescription(`> **Member:** ${member.tag} (${member.id})`)
                    .setColor(client.color)
                    .setTimestamp(Date.now())
                    .setFooter({
                        text: `${interaction.user.tag} | ${client.footer.text}`,
                        iconURL: interaction.member.displayAvatarURL()
                    })
                    .setThumbnail(member.displayAvatarURL());
                
                const channel = client.channels.cache.get('1008315793806737509');
                await channel.send({ embeds: [logEmbed] })

                return;
            }
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(`No warn with the id ${caseID} could be found.`)
                .setColor(0xff0000)
            interaction.reply({ embeds: [embed] })
        })
    },
};