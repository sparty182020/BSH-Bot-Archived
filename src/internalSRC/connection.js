const mysql = require("mysql2");
const chalk = require("chalk");
const { catchErrors } = require("../functions/handlers/handleErrors");

console.log(chalk.green(`[${require('../settings/general.json').prefix}] Loading SQL...`))

const connection = mysql.createConnection({
    host: "HOST",
    user: "USERNAME",
    password: "PASSWORD",
    database: "DATABASE_NAME",
});

async function createModLogs(type, reason, staffId, offenderId) {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const time = hours + ":" + minutes + ":" + seconds;
            const logData = {
                logType: type,
                logTime: time,
                logReason: reason,
                staffId: staffId,
                offenderId: offenderId,
            };
            connection.query(
                "INSERT INTO modLogs SET ?",
                logData,
                function (err, results, fields) {
                    if (err) {
                        catchErrors(err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        } catch (error) {
            reject(error);
            catchErrors(error);
        }
    });
}

async function createPunishLog(type, reason, staffId, offenderId, duration, timestamp) {
    return new Promise(async (resolve, reject) => {
        try {
            // get current time in HH:MM:SS format
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const time = hours + ":" + minutes + ":" + seconds;
            const logData = {
                logType: type,
                logTime: time,
                logReason: reason,
                staffId: staffId,
                offenderId: offenderId,
                logDuration: duration,
                timestamp: timestamp,
            };
            connection.query(
                "INSERT INTO punishLogs SET ?",
                logData,
                function (err, results, fields) {
                    if (err) {
                        catchErrors(err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        } catch (error) {
            reject(error);
            catchErrors(error);
        }
    });
}

async function createAuditRecord(auditType, auditMessage, auditUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            // get current time in HH:MM:SS format
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const time = hours + ":" + minutes + ":" + seconds;
            const auditData = {
                auditType: auditType,
                auditTime: time,
                auditMessage: auditMessage,
                auditUserId: auditUserId,
            };
            connection.query(
                "INSERT INTO audit SET ?",
                auditData,
                function (err, results, fields) {
                    if (err) {
                        catchErrors(err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        } catch (error) {
            reject(error);
            catchErrors(error);
        }
    });
}

console.log(chalk.green(`[${require('../settings/general.json').prefix}] Loaded SQL`))

module.exports = {
    connection,
    createModLogs,
    createPunishLog,
    createAuditRecord,
};
