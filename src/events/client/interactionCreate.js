const { catchErrors } = require('../../functions/handlers/handleErrors');

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            // if interacrtion is a command
            // command variables
            const { commandName } = interaction;
            const command = client.commands.get(commandName);
            if (!command) return;

            // checking if command is disabled
            const { disabled } = require('../../settings/commands.json')
            if (disabled.includes(commandName)) return interaction.reply(
                {
                    content: 'This command is currently disabled',
                    ephemeral: true
                })
            // checking if command is dev only
            const { developers } = require('../../settings/developers.json')
            if (
                command.info.type === 'development'
                && !developers.includes(interaction.user.id)
            ) return interaction.reply(
                {
                    content: 'This command is only accessable by our Developers.\nIf you believe you need to use this please do `/info` to contact a developer.',
                    ephemeral: true
                })

            // adding user to database system
            client.sql.connection.query(`SELECT * FROM settings WHERE discordId = ${interaction.user.id}`, (err, rows, results) => {
                if (err) throw err;

                if (!rows[0]) return;

                const user = []

                for (let i = 0; i < rows.length; i++) user.push(rows[i].discordId);

                // checking if user is in database
                if (!user.includes(interaction.user.id)) {
                    // if not added to database adding them
                    client.sql.connection.query(`INSERT INTO settings (discordId, levelPing, openDM, ticketBlacklist) VALUES (${interaction.user.id}, 1, 1, 0)`, (err, rows) => {
                        if (err) throw err;

                        console.log(`Added ${interaction.user.tag} to the database`)
                    })
                }
            })

            // attempting to execute command
            try {
                await command.execute(interaction, client);
            } catch (error) { catchErrors(error, interaction) }

        } else if (interaction.isButton()) {
            // if interaction is button
            // button variables
            const { buttons } = client;
            const { customId } = interaction;

            // checking for button code
            const button = buttons.get(customId);
            if (!button) throw new Error('There is no code for this button');

            // attempting to execute button code
            try {
                await button.execute(interaction, client);
            } catch (error) {
                catchErrors(error, interaction);
            }
        }
    },
};