const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get to know the bot')
        .addSubcommand(subcommand => subcommand.setName('general').setDescription('Learn the basic commands of the server'))
        .addSubcommand(subcommand => subcommand.setName('moderation').setDescription('Help the mods out!'))
        .addSubcommand(subcommand => subcommand.setName('support').setDescription('Find out more about our support system'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('command')
                .setDescription('Get help on a specific command')
                .addStringOption(option =>
                    option
                        .setName('command')
                        .setDescription('The command you want to know more about')
                        .setRequired(true)
                )
        ),
    info: {
        description: 'Get some navigation around the server and bot',
        usage: '/help <general|moderation|support|command> [command]',
        type: 'utility'
    },
    async execute(interaction, client) {
        const embed = client.embed()

        switch (interaction.options.getSubcommand()) {
            case 'general':
                embed.setTitle('Brian\'s Protector - General Help')
                embed.setDescription('Get to know useful features about the bot')
                embed.setAuthor({
                    name: require('../../settings/general.json').name,
                    iconURL: require('../../settings/general.json').icon,
                    url: require('../../settings/general.json').url
                })
                embed.setFields([
                    {
                        name: 'Server Commands',
                        value: [
                            `Our custom bot has been fully developed by the team at [${require('../../settings/general.json').prefix}](${require('../../settings/general.json').url}), here are some of the commands you can use!`,
                            '',
                            '`/info` - Get some info on the bot',
                            '`/level` - See the level of yourself or another',
                            '`/leaderboard` - See the top 10 users on the server',
                            '`/roleinfo (role)` - Get info on a role',
                            '`/userinfo (user)` - Get info on a user',
                            '`/serverinfo` - Get info on the server',
                            '`/suggest (suggestion)` - Suggest something for the server',
                            '`/chatgpt (message)` - Chat with GPT `[Coming Soon...]`',
                        ].join('\n')
                    }
                ])
                break;
            case 'moderation':
                if (!interaction.member.roles.cache.has('1004426132667498666')) {await interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true}); break}
                embed.setTitle('Brian\'s Protector - Moderation Help')
                embed.setDescription('Get to know useful features about the bot')
                embed.setAuthor({
                    name: require('../../settings/general.json').name,
                    iconURL: require('../../settings/general.json').icon,
                    url: require('../../settings/general.json').url
                })
                embed.setFields([
                    {
                        name: 'Server Moderation System',
                        value: [
                            `The developers are [${require('../../settings/general.json').prefix}](${require('../../settings/general.json').url}) have created and continue to update and improve our a fully custom moderation system for this server.`,
                            '',
                            '`/cases (member)` - Get a list of cases for a user',
                            '`/case (case id)` - Get information about a case',
                            '`/warn (member) (reason)` - Warn a user',
                            '`/unwarn (member) (case id)` - Unwarn a user',
                            '`/kick (member)` - Kick a user',
                            '`/ban (member) (reason) [duration]` - Ban/Tempban a user',
                            '`/unban (member)` - Unban a user',
                            '`/mute (member) (reason) (duration)` - Mute a user',
                            '`/unmute (member)` - Unmute a user',
                            '`/purge (amount)` - Purge messages',
                            '`/lock [reason]` - Lock a channel',
                            '`/unlock [reason]` - Unlock a channel',
                            '`/slowmode [channel] [time -  in seconds]` - Set or get the slowmode of a channel',
                            '`/s-manage <approve|deny|delete|status|blacklist> [<case id>|<user id>] [data]` - Manage suggestions',
                            '`/ticketblacklist <user>` - [Un-]Blacklist a user from opening tickets',
                        ].join('\n')
                    }
                ])
                break;
            case 'support':
                embed.setTitle('Brian\'s Protector - Support Help')
                embed.setDescription('Get to know useful features about the bot')
                embed.setAuthor({
                    name: require('../../settings/general.json').name,
                    iconURL: require('../../settings/general.json').icon,
                    url: require('../../settings/general.json').url
                })
                embed.setFields([
                    {
                        name: 'Server Support System',
                        value: [
                            'In this server, there are multiple different ways you can get help.',
                            'Have a question about the server or need to report someone? Open a ticket in <#1000806050536108162>',
                            'Have a chess question? Ask it in <#1066480533602840728> or DM <@783855260300869632>.',
                            'Have a question about the bot? Open a ticket in <#1000806050536108162> or send an email to `hello@daad.wtf`.',
                            '',
                            'The server members are extremely helpful and will try to help you as much as they can.'
                        ].join('\n')
                    }
                ])
                break;
            case 'command':
                const command = interaction.options.getString('command')
                if (!client.commands.has(command)) {
                    await interaction.reply({content: 'That command does not exist.', ephemeral: true})
                    return
                }

                const theCommand = client.commands.get(command).info
                theCommand.enabled = !require('../../settings/commands.json').disabled.includes(command)

                embed.setTitle(`Brian\'s Protector Help - ${command}`)
                embed.setDescription(`**Name:** \`${command}\`\n**Usage:** \`${theCommand.usage}\`\n**Type:** \`${theCommand.type}\`\n**Description:** ${theCommand.description}\n**Enabled:** ${theCommand.enabled ? 'Yes' : 'No'}`)
                embed.setAuthor({
                    name: require('../../settings/general.json').name,
                    iconURL: require('../../settings/general.json').icon,
                    url: require('../../settings/general.json').url
                });
                break;
        }

        await interaction.reply({embeds: [embed]})
    }
}