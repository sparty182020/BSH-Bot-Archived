const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Join the voice channel you are in')
       .addSubcommandGroup(group =>
            group
                .setName('user')
                .setDescription('General User music commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('join')
                        .setDescription('Join the voice channel you are in')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('pause')
                        .setDescription('Pause the current song')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('play')
                        .setDescription('Play a song')
                        .addStringOption(option =>
                            option
                                .setName('song')
                                .setDescription('Song you want to play')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('queue')
                        .setDescription('Show the current queue')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('skip')
                        .setDescription('Vote skip the current song')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('stop')
                        .setDescription('Vote stop the music')
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('manage')
                .setDescription('Music management commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('move')
                        .setDescription('Move the bot to your voice channel')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('skip')
                        .setDescription('Force-skip the current song')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('stop')
                        .setDescription('Force-stop the music')
                )
        ),
    info: {
        description: 'Music Commands',
        usage: '/music <user|manage> <join|pause|play|queue|skip|stop|move> [song]',
        type: 'music'
    },
    async execute(interaction, client) {
    }
}