const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playstream')
        .setDescription('Play music from a radio station')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    info: {
        description: 'Play music from a radio station',
        usage: '/playstream',
        type: 'music'
    },
    /**
     * 
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {*} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (!interaction.member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command', ephemeral: true });
        
        const resource = 
        createAudioResource('https://live.itsflow.net', {
            inlineVolume: true
        })
        
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })
        
        interaction.reply({ content: 'Playing audio...', ephemeral: true });
        
        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);
        player.play(resource);

    }
}