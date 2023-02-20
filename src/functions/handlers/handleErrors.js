const Sentry = require('@sentry/node');
const Intigrations = require('@sentry/integrations');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const Tracing = require("@sentry/tracing");
const { v5 } = require('uuid');
const crypto = require('crypto');

Sentry.init(
	{
		dsn: "SENTRY_DSN",
		sampleRate: 1.0,
		serverName: "Server",
		integrations: [
			new ProfilingIntegration(),
			new Intigrations.ExtraErrorData({ depth: 20 }),
			new Intigrations.SessionTiming(),
			new Intigrations.Transaction(),
			new Intigrations.ReportingObserver(),
			new Intigrations.CaptureConsole({
				levels: ['error', 'critical', 'fatal', 'warn']
			})
		],
		// @ts-ignore
		profilesSampleRate: 1.0,
		environment: "Development",
		release: "Main",
		sendDefaultPii: false
	}
)

/**
 * @param {Error} error
 * @param {import('discord.js').Interaction | import('discord.js').Message | null} interaction
 */
async function catchErrors(error, interaction) {
	const errorHash = crypto.createHmac('sha512', 'ErrorHashKey-jdlancdsjkn54327869')
		.update(error.stack)
		.digest('hex');
	const errorID = v5(errorHash, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
	await Sentry.captureException(error, { tags: { errorID }, level: 'error' });
	console.log(`New Error Thrown. Error ID: ${errorID}`)
	console.log(error);
	if (interaction && !interaction.author) {
		if (interaction.replied || interaction.deferred) {
			return await interaction.followUp({
				content: ['There was an error while executing this command! Please contact one of my developers of this issue.',
					'To contact them, please join the support server using the `/support` command.',
					'',
					`Please provide this error ID to the developer: \`${errorID}\``].join('\n'),
				ephemeral: true
			})
		}
		return await interaction.reply({
			content: ['There was an error while executing this command! Please contact one of my developers of this issue.',
				'To get info on my developers, please use the `/info` command.',
				'',
				`Please provide this error ID to the developer: \`${errorID}\``].join('\n'),
			ephemeral: true
		})
	}
}

async function captureEvent(event) {
	await Sentry.captureEvent({
		logger: 'custom',
		message: event,
		type: 'default'
	});
}

module.exports = {
	catchErrors,
	captureEvent
}