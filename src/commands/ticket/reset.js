const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('t-reset')
        .setDescription('Reset the staff claims')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to reset the claims for')
                .setRequired(false)
        ),
    info: {
        description: 'Reset all ticket claims back to 0',
        usage: '/t-reset <user>',
        type: 'administration'
    },
    async execute(interaction, client) {
        await interaction.reply({ content: 'Resetting Ticket Count...', ephemeral: true });
        const user = interaction.options.getUser('user');

        if (user === null) {
            client.sql.connection.query(`UPDATE tickets SET staffId = null`)
            await new Promise(resolve => setTimeout(resolve, 2000));

            await interaction.editReply({ content: 'Ticket Count Reset', ephemeral: true });
            return;
        } else {
            client.sql.connection.query(`UPDATE tickets SET staffId = null WHERE staffId = ${user.id}`)
            await new Promise(resolve => setTimeout(resolve, 2000));

            await interaction.editReply({ content: 'Ticket Count Reset', ephemeral: true });
            return;
        }
    }
}