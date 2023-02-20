require("dotenv").config();
const {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const { default: axios } = require("axios");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.GuildMember,
		Partials.GuildMember
	]
});

client.commands = new Collection();
client.buttons = new Collection();
client.commandArray = [];
client.color = 0x5bdfa7;
client.footer = {
	text: `Powered by ${require('./settings/general.json').website}`,
	iconURL: require('./settings/general.json').icon,
}
client.getUptime = require("./internalSRC/uptime").getUptime;
client.sql = require("./internalSRC/connection");
client.serverInvite = require("./settings/general.json").server_invite;
client.embed = () => new EmbedBuilder().setFooter(client.footer).setColor(client.color);
client.automod = require("./internalSRC/automod")
client.on('error', error => require('./functions/handlers/handleErrors').catchErrors(error))

const functionFolers = fs.readdirSync("./src/functions");
for (const folder of functionFolers) {
	const functionFiles = fs
		.readdirSync(`./src/functions/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of functionFiles) {
		if (file.startsWith("handleErrors")) continue;
		require(`./functions/${folder}/${file}`)(client);
	}
}

module.exports = {
	client,
};

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(process.env.token);

const { checkTempBans, checkGiveawayEnds, getWhitelistedWords } = require('./dependancies.js');

setInterval(() => {
	checkTempBans(client.guilds.cache.get('999262466628403250'));
	checkGiveawayEnds(client.guilds.cache.get('999262466628403250'));
	getWhitelistedWords();
	axios.get('https://betteruptime.com/api/v1/heartbeat/DaKu1iVRhkJ44RVR1SaouuPh'); //? uptime heartbeat 
	//! DO NOT REMOVE OR CHANGE UNDER PENALTY OF DEATH >:(
}, 60000);