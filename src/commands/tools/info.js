const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('About the bot'),
    info: {
        description: 'See info about the developers and the bot',
        usage: '/info',
        type: 'utility'
    },
    async execute(interaction, client) {
        const info = {
            "title": "Bot Info",
            "description": "Some details about the custom server bot <@1053800362433318912>",
            "color": client.color,
            "fields": [
                {
                    "name": "Development Team",
                    "value": "<@378251417267339264> **Ted** -- Server Website Developer, Bot Developer\n<@948892965022076978> **Dev** -- Server Website Developer, Core Bot Developer\n<@783855260300869632> **Benpai** -- Core Bot Developer"
                },
                {
                    "name": "Support-Based Commands",
                    "value": "</status:1073613848407441418> - Get stats for the bot\n</uptime:1073600464781840425> - Get the uptime for the bot\n</info:1071087302492823732> - Get info on the bot\n</help:1066582025701691442> - Get help on many different things"
                },
                {
                    "name": "Detail-Based Commands",
                    "value": "</suggest:1070447792864100441> - Submit a suggestion\n</staff:1068606442967421030> - Get commemorative staff info\n</details:1068606442967421029> - Quick details"
                },
                {
                    "name": "Utility-Based Commands",
                    "value": "</serverinfo:1072436818580099084> - Get info on the server\n</roleinfo:1072436818580099083> - Get information on a role\n</memberinfo:1072436818580099082> - Get information on a server member"
                },
                {
                    "name": "System-Based Commands",
                    "value": "</settings:1073501698779254794> - Bot settings\n</leaderboard:1069658099260076072> - Get the XP leaderboard\n</level:1069647110171017260> - Get the level of a member"
                }
            ],
            "author": {
                "name": "Development As A Dependency",
                "url": "https://daad.wtf",
                "icon_url": "https://cdn.discordapp.com/attachments/1064322120261324870/1066463558386331718/IMG_8288.png"
            }
        }

        await interaction.reply({ embeds: [info] });

    }
}