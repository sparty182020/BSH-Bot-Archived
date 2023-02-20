const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendreactions')
        .setDescription('Sends reaction roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    info: {
        description: 'Sends the reaction roles embeds and buttons',
        usage: '/sendreactions',
        type: 'administration'
    },
    async execute(interaction, client) {

        // Colours

        const coloursEmbed = client.embed()
            .setTitle('Colours')
            .setDescription('Select a colour you would like!')
            .setFields([
                {
                    name: '_ _',
                    value: '<:red_circle:1034602281569624194> - Red\n<:orange_circle:1034602281569624194> - Orange\n<:yellow_circle:1034602281569624194> - Yellow\n<:green_circle:1034602281569624194> - Green\n<:blue_circle:1034602281569624194> - Blue\n<:purple_circle:1034602281569624194> - Purple\n<:black_circle:1061412592322629633> - Black\n<:white_circle:1061412731669991524> - White',
                }
            ])

        // 999419511600058479
        const red = new ButtonBuilder()
            .setCustomId('red')
            .setEmoji('🔴')
            .setStyle(ButtonStyle.Secondary);
        
        // 999425253795176579
        const orange = new ButtonBuilder()
            .setCustomId('orange')
            .setEmoji('🟠')
            .setStyle(ButtonStyle.Secondary);

        // 999424455375847474
        const yellow = new ButtonBuilder()
            .setCustomId('yellow')
            .setEmoji('🟡')
            .setStyle(ButtonStyle.Secondary);

        // 999424748956168282
        const green = new ButtonBuilder()
            .setCustomId('green')
            .setEmoji('🟢')
            .setStyle(ButtonStyle.Secondary);

        // 999424462288064587
        const blue = new ButtonBuilder()
            .setCustomId('blue')
            .setEmoji('🔵')
            .setStyle(ButtonStyle.Secondary);
        
        // 999424909820309524
        const purple = new ButtonBuilder()
            .setCustomId('purple')
            .setEmoji('🟣')
            .setStyle(ButtonStyle.Secondary);

        // 999425802577924116
        const black = new ButtonBuilder()
            .setCustomId('black')
            .setEmoji('⚫')
            .setStyle(ButtonStyle.Secondary);
        
        // 999425555302723587
        const white = new ButtonBuilder()
            .setCustomId('white')
            .setEmoji('⚪')
            .setStyle(ButtonStyle.Secondary);

        // Pronouns

        const pronounsEmbed = new EmbedBuilder()
            .setTitle('Pronouns')
            .setDescription('Select the pronoun(s) you itentify with!')
            .setColor(client.color)
            .setFields([
                {
                    name: '_ _',
                    value: '<:blue_square:1034605483685838849> - He/Him\n<:purple_square:1034605483685838849> - She/Her\n<:green_square:1034605483685838849> - They/Them\n<:red_square:1034605483685838849> - Ask/Other',
                }
            ])
            .setFooter(client.footer);

        // 1004415173970362399
        const he = new ButtonBuilder()
            .setCustomId('he')
            .setEmoji('🟦')
            .setStyle(ButtonStyle.Secondary);
        
        // 1004415130643210350
        const she = new ButtonBuilder()
            .setCustomId('she')
            .setEmoji('🟪')
            .setStyle(ButtonStyle.Secondary);

        // 1004415200352546826
        const they = new ButtonBuilder()
            .setCustomId('they')
            .setEmoji('🟩')
            .setStyle(ButtonStyle.Secondary);
        
        // 1004415349220978759
        const ask = new ButtonBuilder()
            .setCustomId('ask')
            .setEmoji('🟥')
            .setStyle(ButtonStyle.Secondary);

        // Mentions

        const mentionsEmbed = new EmbedBuilder()
            .setTitle('Mentions')
            .setDescription('Select what you would like to be pinged for!')
            .setColor(client.color)
            .setFields([
                {
                    name: '_ _',
                    value: '<:arrow_up:1034604338863153233> - Uploads\n<:question:1034604338863153233> - QOTD\n<:date:1034604338863153233> - Events\n<:brain:1034604338863153233> - FOTD\n<:chess_pawn:1061791205039550575> - Chess',
                }
            ])
            .setFooter(client.footer);

        // 999396872617738250
        const uploads = new ButtonBuilder()
            .setCustomId('uploads')
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Secondary);
        
        // 1034574946627764394
        const qotd = new ButtonBuilder()
            .setCustomId('qotd')
            .setEmoji('❓')
            .setStyle(ButtonStyle.Secondary);

        // 999395622065033226
        const events = new ButtonBuilder()
            .setCustomId('events')
            .setEmoji('📅')
            .setStyle(ButtonStyle.Secondary);
        
        // 1041421967644971078
        const fotd = new ButtonBuilder()
            .setCustomId('fotd')
            .setEmoji('🧠')
            .setStyle(ButtonStyle.Secondary);

        // 1061791159833337957
        const chess = new ButtonBuilder()
            .setCustomId('chess')
            .setEmoji('♟️')
            .setStyle(ButtonStyle.Secondary);

        const channel = client.channels.cache.get('999266262054088786');

        await channel.send({
            embeds: [coloursEmbed],
            components: [new ActionRowBuilder().addComponents(red, orange, yellow, green), new ActionRowBuilder().addComponents(blue, purple, black, white)]
        });

        await channel.send({
            embeds: [pronounsEmbed],
            components: [new ActionRowBuilder().addComponents(he, she, they, ask),]
        })

        await channel.send({
            embeds: [mentionsEmbed],
            components: [new ActionRowBuilder().addComponents(uploads, qotd, events), new ActionRowBuilder().addComponents(fotd, chess)]
        })

        await interaction.reply({
            content: `${require('../../settings/emojis.json').badges.green} Sent reactions`,
        });
    },
};