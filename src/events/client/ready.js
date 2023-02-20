const { ActivityType } = require("discord.js");
const chalk = require("chalk");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const prefix = require('../../settings/general.json').prefix;
    console.log(chalk.red(`[${prefix}] Logged in as ${client.user.tag}!`));
    client.user.setActivity("ACTIVITY_TEXT", { type: ActivityType.Watching });
    console.log(
      chalk.red(
        `[${prefix}] Set activity to 'Watching ${client.user.presence.activities[0].name}'`
      )
    );
    console.log(" ");
    console.log(chalk.white(`[${prefix}] Powered by ${require('../../settings/general.json').website}`));
    console.log(chalk.white(`[${prefix}] Developed by X, Y, and Z`));
    console.log(" ");
  },
};
