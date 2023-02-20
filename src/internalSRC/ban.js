/**
 * 
 * @param {import('discord.js').Client} client The bot client
 * @param {string} member The userID member being banned
 * @param {string} staff The userID of the staff member making the ban or "Automod" if automated
 * @param {string} channelID The channelID of the channel the ban was made in
 * @param {string | "None Specified"} reason Reason for the ban
 * @param {string | "Permanent"} duration Duration of the ban
*/

const ban = (client, member, staff, channelID, reason = 'None Specified', duration = "Permanent") => {
    function stringToMilliseconds(timeString) {
        const time = timeString.split(' ');
        let milliseconds = 0;
        for (let i = 0; i < time.length; i++) {
            const unit = time[i].slice(-1);
            const amount = time[i].slice(0, -1);
            switch (unit) {
                case 'w':
                    milliseconds += amount * 604800000;
                    break;
                case 'd':
                    milliseconds += amount * 86400000;
                    break;
                case 'h':
                    milliseconds += amount * 3600000;
                    break;
                case 'm':
                    milliseconds += amount * 60000;
                    break;
                case 's':
                    milliseconds += amount * 1000;
                    break;
                default:
                    milliseconds = 0;
            }
        }
        return milliseconds;
    }
    const banData = {
        banState: "banned",
        banLength: duration,
        banUserId: member,
        banReason: reason,
        temp: Number(duration != "Permanent"),
        automod: Number(staff.toLowerCase() == "automod"),
        appealStatus: 0,
    }

    if (duration != "Permanent") {
        client.sql.createPunishLog("temp ban", reason, staff, member, duration, Math.floor((Date.now() + stringToMilliseconds(duration)) / 1000));
    } else {
        client.sql.createPunishLog("ban", reason, staff, member)
    }
    let returnStatus = [true, `BAN_APPEAL_LINK`];
    client.sql.createModLogs("ban", reason, staff, channelID);
    client.sql.connection.query('INSERT INTO bans SET ?', banData, async (err, results) => {
        if (err) {
            await require('../functions/handlers/handleErrors').catchErrors(err)
            returnStatus = [false, err.message];
        };
    })
    return returnStatus;
}

module.exports = ban