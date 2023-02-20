const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { catchErrors } = require('./handleErrors');
const chalk = require('chalk');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        // looping through the folders in the commands folder
        for (const folder of commandFolders) {
            // collecting javascript files from the commands folder
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
            
            // looping through the files in the commands folder
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());

                console.log(chalk.gray(`[${require('../../settings/general.json').prefix}] Loaded command: ${command.data.name}`))
            }
        }

        const clientId = 'BOT_CLIENT_ID';
        // const guildId = 'GUILD_ID';

        // registering the commands
        const rest = new REST({ version: "9" }).setToken(process.env.token);
        try {
            console.log(" ")
            console.log(chalk.green(`[${require('../../settings/general.json').prefix}] Started refreshing application commands.`));

            await rest.put(Routes.applicationCommands(clientId), { 
                body: client.commandArray, 
            });

            console.log(chalk.green(`[${require('../../settings/general.json').prefix}] Successfully reloaded application commands.`));
            console.log(" ")
        } catch (error) {
            catchErrors(error)
        }
    };
};