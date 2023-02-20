const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Pulls up the commemorative staff info.')
        .addStringOption(option =>
            option
                .setName('user')
                .setDescription('The user to pull up staff info for.')
                .setRequired(true)
        ),
    info: {
        description: 'Pulls up the commemorative staff info.',
        usage: '/staff <user>',
        type: 'utility'
    },
    async execute(interaction, client) {
        const staff = interaction.options.getString('user');
        await fetch(`https://bsh.daad.wtf/api/staff/${staff}`)
            .then(res => {
                if (res.status !== 400 && res.status !== 404) return res.json();
                return interaction.reply('Invalid user');
            })
            .then(async res => {
                if (res) await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Details on ${res.name}`)
                            .setDescription(
                                [
                                    `>>> **Name:** ${res.name}`,
                                    `**Role:** ${res.role}`,
                                    `**Bio:** ${res.bio || "None Provided"}`,
                                    `**Favorite Color:** ${res.favs.color.name || "None Provided"}`,
                                    `**Favorite Food:** ${res.favs.food || "None Provided"}`,
                                    `**Favorite Book:** ${res.favs.book || "None Provided"}`,
                                    `**Favorite TV Show / Movie:** ${res.favs.tv || "None Provided"}`,
                                    `**Favorite Game:** ${res.favs.game || "None Provided"}`,
                                    `**Notable Contributions:** ${res['notable-contribs']}`
                                ].join('\n')
                            )
                            .setTimestamp(Date.now())
                            .setColor(parseInt(res.favs.color.dec, 10))
                            .setThumbnail(`https://bsh.daad.wtf/api/user/${res.id}/avatar`)
                            .setFooter(client.footer)
                    ]
                })
            })
    },
};