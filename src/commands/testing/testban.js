const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ban = require("../../internalSRC/ban");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("testban")
        .setDescription("Test the ban command")
        // .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName("member").setDescription("The member to ban").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The ban reason").setRequired(false))
        .addStringOption(option => option.setName("duration").setDescription("The ban duration (use w,d,h,m,s format) eg. 1w 3d 12h = 1 week, 3 days, and a 12 hours").setRequired(false)),
    info: {
        description: "Test the ban command",
        usage: "/testban <member> <reason> <duration>",
        type: "development"
    },
    async execute(interaction, client) {
        const member = interaction.options.getMember("member");
        const staff = interaction.member;
        const reason = interaction.options.getString("reason") || "No reason provided";
        const duration = interaction.options.getString("duration") || "Permanent";

        if (member.id === staff.id) return interaction.reply({ content: ':x: You cannot ban yourself', ephemeral: true });

        const banStatus = ban(client, member.id, staff.id, interaction.channel.id, reason, duration);

        if (!banStatus[0]) {
            const failure = new EmbedBuilder()
                .setTitle(`Ban Failed`)
                .setDescription(`> **Reason:** ${banStatus[1]}`)
                .setColor(client.color)
                .setTimestamp();

            return interaction.reply({ embeds: [failure] });
        }
        const embed = new EmbedBuilder()
            .setTitle(`Banned`)
            .setDescription(`> **Reason:** ${reason}\n> **Duration:** ${duration}`)
            .setColor(client.color)
            .setTimestamp()
            .setFooter({
                text: `${interaction.user.tag} | ${client.footer.text}`,
                iconURL: interaction.member.displayAvatarURL()
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Ban Appeal")
                    .setURL(banStatus[1])
            );

        interaction.reply({ content: 'Banned', ephemeral: true });

        member.send({ embeds: [embed], components: [row] }).catch(() => {
            interaction.followUp({ content: `I was unable to DM the user about the ban.`, ephemeral: true });
        });
    }
};