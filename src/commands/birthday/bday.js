const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bday')
        .setDescription('Set your birthday')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set your birthday')
                // .addStringOption(option =>
                //     option
                //         .setName('month')
                //         .setDescription('Your birthday month')
                //         .addChoices(
                //             {
                //                 name: 'January',
                //                 value: '1'
                //             },
                //             {
                //                 name: 'February',
                //                 value: '2'
                //             },
                //             {
                //                 name: 'March',
                //                 value: '3'
                //             },
                //             {
                //                 name: 'April',
                //                 value: '4'
                //             },
                //             {
                //                 name: 'May',
                //                 value: '5'
                //             },
                //             {
                //                 name: 'June',
                //                 value: '6'
                //             },
                //             {
                //                 name: 'July',
                //                 value: '7'
                //             },
                //             {
                //                 name: 'August',
                //                 value: '8'
                //             },
                //             {
                //                 name: 'September',
                //                 value: '9'
                //             },
                //             {
                //                 name: 'October',
                //                 value: '10'
                //             },
                //             {
                //                 name: 'November',
                //                 value: '11'
                //             },
                //             {
                //                 name: 'December',
                //                 value: '12'
                //             }
                //         )
                //         .setRequired(true)
                // )
                // .addIntegerOption(option =>
                //     option
                //         .setName('day')
                //         .setDescription('Your birthday day')
                //         .setRequired(true)
                //         .setMinValue(1)
                //         .setMaxValue(31)
                // )
                // .addStringOption(option =>
                //     option
                //         .setName('timezone')
                //         .setDescription('Your timezone')
                //         .setRequired(true)
                //         .setChoices([
                //             {
                //                 name: 'UTC-12:00',
                //                 value: 'Etc/GMT+12'
                //             },
                //             {
                //                 name: 'UTC-11:00',
                //                 value: 'Pacific/Midway'
                //             },
                //             {
                //                 name: 'UTC-10:00',
                //                 value: 'Pacific/Honolulu'
                //             },
                //             {
                //                 name: 'UTC-09:30',
                //                 value: 'Pacific/Marquesas'
                //             },
                //             {
                //                 name: 'UTC-09:00',
                //                 value: 'America/Anchorage'
                //             },
                //             {
                //                 name: 'UTC-08:00',
                //                 value: 'America/Los_Angeles'
                //             },
                //             {
                //                 name: 'UTC-07:00',
                //                 value: 'America/Denver'
                //             },
                //             {
                //                 name: 'UTC-06:00',
                //                 value: 'America/Chicago'
                //             },
                //             {
                //                 name: 'UTC-05:00',
                //                 value: 'America/New_York'
                //             },
                //             {
                //                 name: 'UTC-04:00',
                //                 value: 'America/Caracas'
                //             },
                //             {
                //                 name: 'UTC-03:30',
                //                 value: 'America/St_Johns'
                //             },
                //             {
                //                 name: 'UTC-03:00',
                //                 value: 'America/Sao_Paulo'
                //             },
                //             {
                //                 name: 'UTC-02:00',
                //                 value: 'America/Noronha'
                //             },
                //             {
                //                 name: 'UTC-01:00',
                //                 value: 'Atlantic/Cape_Verde'
                //             },
                //             {
                //                 name: 'UTC',
                //                 value: 'Europe/London'
                //             },
                //             {
                //                 name: 'UTC+01:00',
                //                 value: 'Europe/Paris'
                //             },
                //             {
                //                 name: 'UTC+02:00',
                //                 value: 'Europe/Helsinki'
                //             },
                //             {
                //                 name: 'UTC+03:00',
                //                 value: 'Europe/Moscow'
                //             },
                //             {
                //                 name: 'UTC+03:30',
                //                 value: 'Asia/Tehran'
                //             },
                //             {
                //                 name: 'UTC+04:00',
                //                 value: 'Asia/Dubai'
                //             },
                //             {
                //                 name: 'UTC+04:30',
                //                 value: 'Asia/Kabul'
                //             },
                //             {
                //                 name: 'UTC+05:00',
                //                 value: 'Asia/Tashkent'
                //             },
                //             {
                //                 name: 'UTC+05:30',
                //                 value: 'Asia/Kolkata'
                //             },
                //             {
                //                 name: 'UTC+05:45',
                //                 value: 'Asia/Kathmandu'
                //             },
                //             {
                //                 name: 'UTC+06:00',
                //                 value: 'Asia/Dhaka'
                //             },
                //             {
                //                 name: 'UTC+06:30',
                //                 value: 'Asia/Rangoon'
                //             },
                //             {
                //                 name: 'UTC+07:00',
                //                 value: 'Asia/Bangkok'
                //             },
                //             {
                //                 name: 'UTC+08:00',
                //                 value: 'Asia/Shanghai'
                //             },
                //             {
                //                 name: 'UTC+08:45',
                //                 value: 'Australia/Eucla'
                //             },
                //             {
                //                 name: 'UTC+09:00',
                //                 value: 'Asia/Tokyo'
                //             },
                //             {
                //                 name: 'UTC+09:30',
                //                 value: 'Australia/Darwin'
                //             },
                //             {
                //                 name: 'UTC+10:00',
                //                 value: 'Australia/Brisbane'
                //             },
                //             {
                //                 name: 'UTC+10:30',
                //                 value: 'Australia/Lord_Howe'
                //             },
                //             {
                //                 name: 'UTC+11:00',
                //                 value: 'Pacific/Noumea'
                //             },
                //             {
                //                 name: 'UTC+11:30',
                //                 value: 'Pacific/Norfolk'
                //             }
                //         ])
                // )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get upcoming birthdays')
        ),
    info: {
        description: 'Add your birthday to the bot so we can wish you a happy birthday!',
        usage: '/bday <set|list> [<date> <timezone>]',
        type: 'utility'
    },
    async execute(interaction, client) {
        switch (interaction.options.getSubcommand()) {
            case 'set':
                const month = interaction.options.getString('month');
                const day = interaction.options.getInteger('day');
                const timezone = interaction.options.getString('timezone');
                const formatedDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZoneName: 'longOffset', timeZone: timezone }).format(new Date(`2021-${month}-${day}`));
                const embed = client.embed()
                    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
                    .setTitle('Birthday set!')
                    .setDescription(`Your birthday has been set to ${formatedDate}!`)
                await interaction.reply({ embeds: [embed] });
                break;
            case 'list':
                break;
        }
    }
}