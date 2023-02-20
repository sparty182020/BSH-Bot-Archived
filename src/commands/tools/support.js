const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get to know the support system'),
    info: {
        description: 'Get to know the support system',
        usage: '/support',
        type: 'utility'
    },
    async execute(interaction, client) {
        await interaction.reply(
            {
                content: 'Join the support server',
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel('View Web Support')
                                .setURL('SUPPORT_WEBSITE_URL')
                        )
                ]
            }
        )
    }
}