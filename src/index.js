require('./lib/setup');
require('dotenv').config({ path: './src/.env' });
const { LogLevel, SapphireClient } = require('@sapphire/framework'),
	mongoose = require('mongoose');

const client = new SapphireClient({
	defaultPrefix: process.env.PREFIX,
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	]
});

client.db = require('./database/mongodb');

const main = async () => {
	try {
		await mongoose
			.connect(process.env.MONGO_DB, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			})
			.then(() => {
				client.logger.info('MongoDB connected');
			})
			.catch((err) => {
				client.logger.error(`Unable to connect MongoDB. Error: ${err}`);
			});

		client.logger.info('Logging in');
		await client.login(process.env.TOKEN);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
