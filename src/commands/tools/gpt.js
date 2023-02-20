const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatgpt')
        .setDescription('Use Chat-GPT')
        .addStringOption(option => option.setName('input').setDescription('Input text').setRequired(true)),
    info: {
        description: 'Use Chat-GPT from the bot and have a conversation with it',
        usage: '/chatgpt <input>',
        type: 'fun'
    },
    async execute(interaction, client) {
        // link command to api
        // run through AutoMod and punish person running command
        // if staff member, don't punish but send a warning to admin chat
    }
}