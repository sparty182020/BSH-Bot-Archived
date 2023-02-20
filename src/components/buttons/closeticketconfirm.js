const { default: discordTranscripts, ExportReturnType } = require("discord-html-transcripts");
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const ssh2 = require("ssh2");
const { v5 } = require("uuid");

module.exports = {
	data: {
		name: `closeTicketConfirm`,
	},
	async execute(interaction, client) {
		const channel = await interaction.guild.channels.fetch(
			interaction.channelId
		);
		const logChan = await interaction.guild.channels.fetch(
			"TICKET_LOG_CHANNEL_ID"
		);

		client.sql.connection.query(
			`SELECT * FROM tickets WHERE channelId = ${channel.id}`,
			async (err, results) => {
				if (err) throw err;

				if (results.length === 0) {
					await interaction.reply({
						content: `This channel is not a ticket.`,
						ephemeral: true,
					});
					return;
				} else {
					const id = results[0].ticketId;
					const SSHConnection = new ssh2.Client();

					const attachmentString = await discordTranscripts.createTranscript(
						channel,
						{
							saveImages: true,
							returnType: ExportReturnType.String,
							poweredBy: false,
							footerText: `Exported {number} messages - Powered by ${require('../../settings/general.json').website}`,
							filename: `ticket-${id}.html`,
						}
					);



					await channel.delete();

					const logEmbed = client.embed()
						.setTitle(`Ticket Closed`)
						.addFields([
							{
								name: `_ _`,
								value: `**Ticket ID**\n${id}\n\n**Ticket Creator**\n<@${results[0].memberId}>`,
								inline: true,
							},
							{
								name: `_ _`,
								value: `**Closed By**\n<@${interaction.user.id
									}>\n\n**Claimed By**\n${results[0].staffId === null
										? "Not Claimed"
										: `<@${results[0].staffId}>`
									}`,
								inline: true,
							},
						]);

					const linkButton = new ButtonBuilder()
						.setStyle(ButtonStyle.Link)
						.setLabel("View Transcript")
						.setURL(`https://bsh.daad.wtf/panel/logs/ticketlogs/${id}`);

					const memberEmbed = client.embed()
						.setTitle(`Ticket Closed`)
						.setDescription(`Your ticket has been closed by <@${interaction.user.id}>.`)

					const member = await interaction.guild.members.fetch(
						results[0].memberId
					);

					await member.send({
						embeds: [memberEmbed],
					});

					await logChan.send({
						embeds: [logEmbed],
						components: [new ActionRowBuilder().addComponents(linkButton)],
					});

					const uuid = v5(JSON.stringify({ id, timestamp: Date.now(), random: parseInt(Math.random().toString().replace('0.', '')) }), "6ba7b810-9dad-11d1-80b4-00c04fd430c8");
					SSHConnection.on("ready", () => {
						SSHConnection.sftp((err, sftp) => {
							if (err) throw err;

							sftp.writeFile(
								`/web/npm/data/cdn/bshpanel/tickets/${uuid}.html`,
								attachmentString,
								(err) => {
									if (err) throw err;
									console.log(
										`Successfully uploaded ${uuid}.html to the CDN`
									);
								}
							);
						});
					}).connect({
						host: 'CDN_HOST',
						username: 'cdn',
						password: 'CDN_PASSWORD'
					});

					client.sql.connection.query(
						"UPDATE tickets SET transcript = ? WHERE ticketId = ?",
						[uuid, id],
						(err, results) => {
							if (err) throw err;
						}
					);

					await new Promise((resolve) => setTimeout(resolve, 2500));
				}
			}
		);
	},
};
