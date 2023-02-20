const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blockedwords')
        .setDescription('Manage blocked words')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all blocked words')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a blocked word')
                .addStringOption(option => option
                    .setName('word')
                    .setDescription('The word to add')
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('punishment')
                    .setDescription('The type of punishment')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'Mute',
                            value: 'mute'
                        },
                        {
                            name: 'Kick',
                            value: 'kick'
                        },
                        {
                            name: 'Ban',
                            value: 'ban'
                        },
                        {
                            name: 'Warn',
                            value: 'warn'
                        },
                        {
                            name: 'Delete',
                            value: 'delete'
                        }
                    )
                )
                .addStringOption(option => option
                    .setName('duration')
                    .setDescription('The duration of the punishment (s/m/h/d/w)')
                    .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a blocked word')
                .addStringOption(option => option
                    .setName('word')
                    .setDescription('The word to remove')
                    .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('whitelist')
                .setDescription('Whitelist certain terms from being blocked')
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('The type task add/remove/list')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'Add',
                            value: 'add'
                        },
                        {
                            name: 'Remove',
                            value: 'remove'
                        },
                        {
                            name: 'List',
                            value: 'list'
                        }
                    )
                )
                .addStringOption(option => option
                    .setName('word')
                    .setDescription('The word to add/remove')
                    .setRequired(false))
        ),
    info: {
        description: 'Manage the AutoModeration system of the server',
        usage: '\n/blockedwords <list/add/remove> <word> <punishment> <duration>\n/blockedwords whitelist <list/add/remove> <word>',
        type: 'administration'
    },
    async execute(interaction, client) {
        const word = interaction.options.getString('word')
        const punishment = interaction.options.getString('punishment') || null
        const duration = interaction.options.getString('duration') || null

        if (duration != null) {
            const type = duration.split(' ')[1]
            const validTypes = ['s', 'm', 'h', 'd', 'w']

            if (!validTypes.includes(type)) {
                await interaction.reply('Invalid duration type! (s/m/h/d/w)')
                return;
            }
        }

        switch (interaction.options.getSubcommand()) {
            case 'list':
                client.sql.connection.query(`SELECT * FROM bannedWords WHERE punishType <> 'whitelist'`, async (err, results, fields) => {
                    if (err) throw err;

                    const words = []

                    results.forEach(result => words.push(result.word))

                    const embed = client.embed()
                        .setTitle('Blocked Words')
                        .setDescription(`${words.join(', ')}`)
                    await interaction.reply({ embeds: [embed] })
                })
                break;
            case 'add':
                client.sql.connection.query(`SELECT word FROM bannedWords`, async (err, results, fields) => {
                    if (err) throw err;

                    const words = []

                    results.forEach(result => words.push(result.word))

                    if (words.includes(word)) {
                        await interaction.reply('Word already exists!')
                    } else {
                        const logData = {
                            word: word,
                            punishType: punishment,
                            punishTime: duration,
                        };
                        client.sql.connection.query(
                            "INSERT INTO bannedWords SET ?",
                            logData,
                            function (err, ...args) {
                                if (err) throw err;
                            }
                        );

                        const embed = client.embed()
                            .setTitle('Blocked Word Added')
                            .setDescription(`> **Word:** ${word}\n> **Punishment:** ${punishment}\n> **Duration:** ${duration || 'None'}`)
                        await interaction.reply({ embeds: [embed] })
                    }
                })
                break;
            case 'remove':
                client.sql.connection.query(`SELECT word FROM bannedWords`, async (err, results, fields) => {
                    if (err) throw err;

                    const words = []

                    results.forEach(result => words.push(result.word))

                    if (!words.includes(word)) {
                        await interaction.reply('Word does not exist!')
                    } else {
                        client.sql.connection.query(`DELETE FROM bannedWords WHERE word='${word}'`, async (err, results, fields) => {
                            if (err) throw err;
                        })

                        const embed = client.embed()
                            .setTitle(`${require('../../settings/emojis.json').badges.green} Blocked Word Removed`)
                            .setDescription(`> **Word:** ${word}`)
                        await interaction.reply({ embeds: [embed] })
                    }
                })
                break;
            case 'whitelist':
                const type = interaction.options.getString('type')
                const whitelistWord = interaction.options.getString('word')

                switch (type) {
                    case 'add':
                        if (!whitelistWord) return await interaction.reply('Please provide a word to remove!');

                        client.sql.connection.query(`SELECT word FROM bannedWords WHERE punishType = 'whitelist'`, async (err, results, fields) => {
                            if (err) throw err;
        
                            const words = []
        
                            results.forEach(result => words.push(result.word))
        
                            if (words.includes(whitelistWord)) {
                                await interaction.reply('Word already exists!')
                            } else {
                                const logData = {
                                    word: whitelistWord,
                                    punishType: 'whitelist',
                                    punishTime: null,
                                };
                                client.sql.connection.query(
                                    "INSERT INTO bannedWords SET ?",
                                    logData,
                                    function (err, ...args) {
                                        if (err) throw err;
                                    }
                                );
        
                                const embed = client.embed()
                                    .setTitle(`${require('../../settings/emojis.json').badges.green} Whitelisted Word Added`)
                                    .setDescription(`> **Word:** ${whitelistWord}`)
                                await interaction.reply({ embeds: [embed] })
                            }
                        });
                        break;
                    case 'remove':
                        if (!whitelistWord) return await interaction.reply('Please provide a word to remove!');

                        client.sql.connection.query(`SELECT word FROM bannedWords WHERE punishType = 'whitelist'`, async (err, results, fields) => {
                            if (err) throw err;

                            const words = [];

                            results.forEach(result => words.push(result.word));

                            if (!words.includes(whitelistWord)) {
                                await interaction.reply('Word does not exist!')
                            }
                            else {
                                client.sql.connection.query(`DELETE FROM bannedWords WHERE word='${whitelistWord}'`, async (err, results, fields) => {
                                    if (err) throw err;
                                })

                                const embed = client.embed()
                                    .setTitle(`${require('../../settings/emojis.json').badges.green} Whitelisted Word Removed`)
                                    .setDescription(`> **Word:** ${whitelistWord}`)
                                await interaction.reply({ embeds: [embed] })
                            }
                        });
                        break;
                    case 'list':
                        client.sql.connection.query(`SELECT * FROM bannedWords WHERE punishType = 'whitelist'`, async (err, results, fields) => {
                            if (err) throw err;
        
                            const words = []
        
                            results.forEach(result => words.push(result.word))
        
                            const embed = client.embed()
                                .setTitle('Whitelisted Words')
                                .setDescription(`${words.join(', ')}`)
                            await interaction.reply({ embeds: [embed] })
                        })
                }
        }
    },
};