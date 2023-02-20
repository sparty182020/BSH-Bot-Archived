const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, CommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { catchErrors } = require('../../functions/handlers/handleErrors.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the leaderboard for the server'),
    info: {
        description: 'Get the top 10 highest leveled members in the server',
        usage: '/leaderboard',
        type: 'utility'
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        client.sql.connection.query(`SELECT * FROM levels ORDER BY level DESC, xp DESC`, async (err, results, rows) => {
            if (err) throw err;

            await interaction.deferReply();

            const embed = client.embed()
                .setTitle('Leaderboard')
                .setTimestamp()
            for (let i = 0; i < 10; i++) {
                await client.guilds.fetch(interaction.guild.id).then(async guild => {
                    await guild.members.fetch(results[i].discordId).then(async member => {
                        await embed.addFields(
                            {
                                value: `**Level:** ${results[i].level}\n**XP:** ${results[i].xp}`,
                                name: `**${i + 1}.** ${member.user.tag}`,
                            }
                        )
                    })
                })
            }
            await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('View Web Leaderboard')
            .setURL('https://bsh.daad.wtf/leaderboard/')
            )] })
        }).on('error', catchErrors)
    }
};