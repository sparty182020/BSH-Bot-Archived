const mysql = require('mysql2');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const chalk = require('chalk');

const connection = mysql.createConnection({
    host: "HOST",
    user: "username",
    password: "password",
    database: "DATABASE_NAME",
});

console.log(chalk.green(`[${require('./settings/general.json').prefix}] Dependancies Loading...`))

async function checkTempBans(server) {
    connection.query(`SELECT * FROM punishLogs WHERE logType = 'temp ban'`, function (err, results, fields) {
        if (err) throw err;
        if (results.length < 0) return
        for (let i = 0; i < results.length; i++) {
            if (results[i].timestamp < Math.floor(Date.now() / 1000)) {
                connection.query(`UPDATE punishLogs SET logType = 'unban <temp>' WHERE logId = '${results[i].logId}'`)
                server.members.unban(results[i].offenderId).catch(err => {
                    console.log(err)
                })
            }
        }
    });
}

const whitelisted = [];
async function getWhitelistedWords() {
    connection.query(`SELECT * FROM bannedWords WHERE punishType = 'whitelist'`, function (err, rows, fields) {
        if (err) throw err;
        if (rows.length < 1) return;

        for (let i = 0; i < rows.length; i++) {
            whitelisted.push(rows[i].word);
        }
    });
}

async function checkGiveawayEnds(server) {
    connection.query(`SELECT * FROM giveaways WHERE ended = 0`, async function (err, results, fields) {
        if (err) throw err;
        // if (results.length < 1) return;

        for (let i = 0; i < results.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (results[i].endTime < Math.floor(Date.now() / 1000)) {
                const giveawayId = results[i].giveawayId;

                connection.query(`UPDATE giveaways SET ended = 1 WHERE giveawayId = '${giveawayId}'`)
                connection.query(`SELECT * FROM giveaway${giveawayId} ORDER BY RAND() LIMIT 1;`, async function (err, results, fields) {
                    if (err) return;

                    const winner = results[0].memberId;
                    connection.query(`UPDATE giveaways SET winner = ? WHERE giveawayId = '${giveawayId}'`, winner)
                });

                await new Promise(resolve => setTimeout(resolve, 1000));

                connection.query(`SELECT * FROM giveaways WHERE giveawayId = '${giveawayId}'`, async function (err, results, fields) {
                    if (err) return;

                    const channel = server.channels.cache.get(results[0].channelId);
                    const msg = channel.messages.fetch(results[0].messageId);

                    const host = results[0].hostId;

                    const embed = new EmbedBuilder()
                        .setTitle(`${results[0].prize}`)
                        .setDescription(`**Ended:** <t:${results[0].endTime}:R>\n**Hosted By:** <@${host}>\n**Winner:** <@${results[0].winner}>`)
                        .setColor(0x0f00)
                        .setTimestamp()
                        .setFooter({
                            text: `Giveaway ID: ${results[0].giveawayId}`,
                        })

                    const button = new ButtonBuilder()
                        .setCustomId(`${results[0].giveawayId}}`)
                        .setEmoji('🎉')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true);

                    await msg.edit({
                        embeds: [embed],
                        components: [new ActionRowBuilder().addComponents(button)],
                    })

                    await channel.send({
                        content: `<@${results[0].winner}> has won **${results[0].prize}**!`
                    })
                })
            }
        }
    });
}

console.log(chalk.green(`[${require('./settings/general.json').prefix}] Dependancies Loaded!`))

getWhitelistedWords();
module.exports = { checkTempBans, getWhitelistedWords, checkGiveawayEnds, whitelisted }