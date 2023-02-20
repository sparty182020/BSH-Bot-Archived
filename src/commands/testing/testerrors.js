const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('error')
        .setDescription('Throw a test error')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    info: {
        description: 'Throw a test error',
        usage: '/error',
        type: 'development'
    },
    async execute(interaction, client) {
        class TestError extends Error {
            constructor(message, ...args) {
                super(message, ...args);
                this.name = 'Test Error';
            }
        }

        throw new TestError("Testing Error")
    }
}