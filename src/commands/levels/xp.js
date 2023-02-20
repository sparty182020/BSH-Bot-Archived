const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Show\'s a member\'s level')
        .addUserOption(option => option.setName('member').setDescription('The member to view the level of').setRequired(false)),
    info: {
        description: 'Get the level of yourself or another member',
        usage: '/level [member]',
        type: 'utility'
    },
    /**
     * 
     * @param {import('discord.js').CommandInteraction} interaction 
     * @param {*} client 
     */
    async execute(interaction, client) {
        Canvas.GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'assets', 'fonts', 'Cubano.ttf'), 'Cubano')
        const target = interaction.options.getUser('member') || interaction.user;
        client.sql.connection.query(`SELECT * FROM levels WHERE discordId = '${target.id}'`, async (err, results, rows) => {
            if (err) throw err;

            if (results.length < 1) {
                return await interaction.reply({ content: `Sorry, I can not find any xp for this user`, ephemeral: true })
            }

            await interaction.deferReply()

            const canvas = Canvas.createCanvas(860, 300);
            const context = canvas.getContext('2d');
            context.fillStyle = "#1D1E22"
            context.rect(0, 0, canvas.width, canvas.height);
            context.fill();
            context.font = '40px Cubano';
            context.fillStyle = '#ffffff';
            context.fillText(
                target.username.replace(/[^ \!"#$%&'\(\)\*\+,\-\.\/0-9\:\;<\=>\?@A-Z\[\\\]\^\_a-z\{\|\}~]/gmi, ''),
                302,
                canvas.height / 3.5
            );
            context.font = '34px Cubano'
            context.fillStyle = '#ffffff';
            context.fillText(
                `Level: ${results[0].level}    XP: ${results[0].xp}`,
                312,
                canvas.height / 1.8
            );
            context.font = '34px Cubano'
            context.fillStyle = '#ffffff';
            context.fillText(
                `Next level in ${(100 * results[0].level + 75) - results[0].xp} XP`,
                312,
                canvas.height / 1.3
            );
            context.beginPath();
            context.arc(150, 150, 128, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();
            const avatar = await Canvas.loadImage(target.displayAvatarURL({ extension: 'jpg', size: 256, dynamic: true }));
            context.drawImage(avatar, 22, 22, 256, 256);

            const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'profile-image.jpg' });

            await interaction.editReply({ files: [attachment] })
        })
    }
};