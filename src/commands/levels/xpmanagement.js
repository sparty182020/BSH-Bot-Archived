const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { connection } = require('../../internalSRC/connection')
const Canvas = require('@napi-rs/canvas');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp-management')
        .setDescription('XP Management commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add XP to a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User you want to add XP to')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('xp')
                        .setDescription('Amount of XP you want to add')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(50000)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove XP from a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User you want to remove XP from')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('xp')
                        .setDescription('Amount of XP you want to remove')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(50000)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set the level of a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User you want to set the level of')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('level')
                        .setDescription('Level you want to set')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(200)
                )
        ),
    info: {
        description: 'Manage the XP and Levels of the server',
        usage: '/xp-management <add|remove|set> <user> <amount|level>',
        type: 'utility'
    },
    async execute(interaction, client) {
        const target = interaction.options.getUser('user')
        switch (interaction.options.getSubcommand()) {
            case 'add':

                client.sql.connection.query(`SELECT * FROM levels WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                    Canvas.GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'assets', 'fonts', 'Cubano.ttf'), 'Cubano')

                    if (err) throw err;

                    if (results.length < 1) {
                        return await interaction.reply({ content: `This user doesn't have any xp yet.`, ephemeral: true })
                    }

                    const { xp: oldxp, level: oldlevel } = results[0]

                    await interaction.deferReply();

                    async function getlevelandxp() {
                        let level = oldlevel
                        let combinedXp = parseInt(oldxp + interaction.options.getInteger('xp'));
                        for (let xpNeeded = 100 * level + 75; combinedXp >= xpNeeded; xpNeeded = 100 * level + 75) {
                            combinedXp -= xpNeeded;
                            level++;
                        }
                        return [combinedXp, level];
                    }

                    const [newxp, newlevel] = await getlevelandxp();

                    client.sql.connection.query(`UPDATE levels SET xp = ${newxp}, level = ${newlevel} WHERE discordId = '${target.id}'`, async (err, updatedresults, updatedrows) => {
                        if (err) throw err;

                        const embed = client.embed()
                            .setTitle(`${require('../../settings/emojis.json').badges.green} Success`)
                            .setDescription(`Added ${interaction.options.getInteger('xp')} xp to ${target.tag}`)
                        await interaction.editReply({ embeds: [embed] })

                        if (oldlevel !== newlevel) {
                            const levelChannel = interaction.guild.channels.cache.get('1006372974015807589');

                            async function provideRoles(member, level) {
                                await member.roles.remove('999314344158449664')
                                await member.roles.remove('999314775408390316')
                                await member.roles.remove('999315163205341274')
                                await member.roles.remove('999315561970405427')
                                await member.roles.remove('999315871786864701')
                                await member.roles.remove('999316308728500305')
                                await member.roles.remove('999316697574031410')
                                await member.roles.remove('999317061740265492')
                                await member.roles.remove('999317207014195251')
                                if (level >= 5 && level < 10) await member.roles.add('999314344158449664')
                                if (level >= 10 && level < 20) await member.roles.add('999314775408390316')
                                if (level >= 20 && level < 30) await member.roles.add('999315163205341274')
                                if (level >= 30 && level < 40) await member.roles.add('999315561970405427')
                                if (level >= 40 && level < 50) await member.roles.add('999315871786864701')
                                if (level >= 50 && level < 60) await member.roles.add('999316308728500305')
                                if (level >= 60 && level < 75) await member.roles.add('999316697574031410')
                                if (level >= 75 && level < 100) await member.roles.add('999317061740265492')
                                if (level >= 100) await member.roles.add('999317207014195251')
                            }

                            await provideRoles(interaction.guild.members.cache.get(target.id), newlevel);

                            const canvas = Canvas.createCanvas(860, 300);
                            const context = canvas.getContext('2d');
                            context.fillStyle = "#1D1E22"
                            context.rect(0, 0, canvas.width, canvas.height);
                            context.fill();
                            context.font = '40px Cubano';
                            context.fillStyle = '#ffffff';
                            context.fillText(
                                target.username.replace(/[^ #'\*\-\.0-9A-Z\_a-z]/gmi, ''),
                                canvas.width / 2.5 - 30,
                                canvas.height / 3.5
                            );
                            context.font = '34px Cubano'
                            context.fillStyle = '#ffffff';
                            context.fillText(
                                `LEVEL UP`,
                                canvas.width / 2.5 - 30,
                                canvas.height / 1.8
                            );
                            context.font = '34px Cubano'
                            context.fillStyle = '#ffffff';
                            context.fillText(
                                `LEVEL ${oldLevel} - ${newlevel}`,
                                canvas.width / 2.5 - 30,
                                canvas.height / 1.3
                            );
                            context.beginPath();
                            context.arc(150, 150, 128, 0, Math.PI * 2, true);
                            context.closePath();
                            context.clip();
                            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'jpg', size: 256, dynamic: true }));
                            context.drawImage(avatar, 22, 22, 256, 256);

                            const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'profile-image.jpg' });

                            client.sql.connection.query(`SELECT levelPing FROM settings WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                                if (err) throw err;

                                levelChannel.send({
                                    content: Boolean(results[0].levelPing) ? `<@${target.id}>` : null,
                                    files: [attachment]
                                })
                            })
                        }
                    })
                })
                break;
            case 'remove':
                client.sql.connection.query(`SELECT * FROM levels WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                    if (err) throw err;

                    if (results.length < 1) {
                        return await interaction.reply({ content: `This user doesn't have any xp yet.`, ephemeral: true })
                    }

                    const { xp: oldxp, level: oldlevel } = results[0];

                    await interaction.deferReply();

                    async function getlevelandxp() {
                        let xp = parseInt(oldxp);
                        let level = parseInt(oldlevel);
                        let xpDifference = (xp - interaction.options.getInteger('xp'));
                        let endValue = [xp, level];
                        while (xpDifference < 0) {
                            if (level === 1) {
                                endValue = [0, 1];
                                break;
                            }
                            xpDifference += (level * 100 + 75);
                            level--;
                        }
                        endValue = [xpDifference, level];
                        return endValue;
                    }

                    const [newxp, newlevel] = await getlevelandxp();

                    async function provideRoles(member, level) {
                        await member.roles.remove('999314344158449664')
                        await member.roles.remove('999314775408390316')
                        await member.roles.remove('999315163205341274')
                        await member.roles.remove('999315561970405427')
                        await member.roles.remove('999315871786864701')
                        await member.roles.remove('999316308728500305')
                        await member.roles.remove('999316697574031410')
                        await member.roles.remove('999317061740265492')
                        await member.roles.remove('999317207014195251')
                        if (level >= 5 && level < 10) await member.roles.add('999314344158449664')
                        if (level >= 10 && level < 20) await member.roles.add('999314775408390316')
                        if (level >= 20 && level < 30) await member.roles.add('999315163205341274')
                        if (level >= 30 && level < 40) await member.roles.add('999315561970405427')
                        if (level >= 40 && level < 50) await member.roles.add('999315871786864701')
                        if (level >= 50 && level < 60) await member.roles.add('999316308728500305')
                        if (level >= 60 && level < 75) await member.roles.add('999316697574031410')
                        if (level >= 75 && level < 100) await member.roles.add('999317061740265492')
                        if (level >= 100) await member.roles.add('999317207014195251')
                    }

                    await provideRoles(interaction.guild.members.cache.get(target.id), newlevel);

                    client.sql.connection.query(`UPDATE levels SET xp = ${newxp}, level = ${newlevel} WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                        if (err) throw err;

                        const embed = client.embed()
                            .setTitle(`${require('../../settings/emojis.json').badges.green} Success`)
                            .setDescription(`Removed ${interaction.options.getInteger('xp')} xp to ${target.tag}`)
                        await interaction.editReply({ embeds: [embed] })
                    })
                })
                break;
            case 'set':
                client.sql.connection.query(`SELECT * FROM levels WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                    if (err) throw err;

                    if (results.length < 1) {
                        return await interaction.reply({ content: `This user doesn't have any xp yet.`, ephemeral: true })
                    }

                    await interaction.deferReply();

                    client.sql.connection.query(`UPDATE levels SET level = ${interaction.options.getInteger('level')} WHERE discordId = '${target.id}'`, async (err, results, rows) => {
                        if (err) throw err;

                        const level = interaction.options.getInteger('level');

                        async function provideRoles(member, level) {
                            await member.roles.remove('999314344158449664')
                            await member.roles.remove('999314775408390316')
                            await member.roles.remove('999315163205341274')
                            await member.roles.remove('999315561970405427')
                            await member.roles.remove('999315871786864701')
                            await member.roles.remove('999316308728500305')
                            await member.roles.remove('999316697574031410')
                            await member.roles.remove('999317061740265492')
                            await member.roles.remove('999317207014195251')
                            if (level >= 5 && level < 10) await member.roles.add('999314344158449664')
                            if (level >= 10 && level < 20) await member.roles.add('999314775408390316')
                            if (level >= 20 && level < 30) await member.roles.add('999315163205341274')
                            if (level >= 30 && level < 40) await member.roles.add('999315561970405427')
                            if (level >= 40 && level < 50) await member.roles.add('999315871786864701')
                            if (level >= 50 && level < 60) await member.roles.add('999316308728500305')
                            if (level >= 60 && level < 75) await member.roles.add('999316697574031410')
                            if (level >= 75 && level < 100) await member.roles.add('999317061740265492')
                            if (level >= 100) await member.roles.add('999317207014195251')
                        }

                        await provideRoles(interaction.guild.members.cache.get(target.id), level);

                        const embed = client.embed()
                            .setTitle(`${require('../../settings/emojis.json').badges.green} Success`)
                            .setDescription(`Set ${target.tag}'s level to ${interaction.options.getInteger('level')} level(s)`)
                        await interaction.editReply({ embeds: [embed] })
                    })
                })
                break;
        }
    }
}