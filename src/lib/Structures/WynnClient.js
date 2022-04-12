const { SapphireClient, container } = require('@sapphire/framework');
const Discord = require('discord.js');

async function fetchPrefix(message) {
	const guild = await this.db.fetchGuild(message.guild.id);
	return guild.prefix;
}

async function checkTimeCoolDown(id, name, delay, t) {
	if (process.env.OWNER_IDS.split(',').includes(id)) {
		return;
	}
	const getTimeout = container.client.options.timeouts.get(`${id}_${name}`) || 0;
	if (Date.now() - getTimeout < 0) {
		return t('preconditions:preconditionCooldown', {
			remaining: `\`${(getTimeout - Date.now()) / 1000}s\``
		});
	}
	container.client.options.timeouts.set(`${id}_${name}`, Date.now() + (delay || 0));
}

class WynnClient extends SapphireClient {
	constructor(options) {
		super({
			...options,
			i18n: {
				defaultMissingKey: 'missing',
				defaultNS: 'default',
				i18next: {
					preload: ['en-US', 'vi-VN'],
					load: 'currentOnly',
					lowerCaseLng: false,
					fallbackLng: 'en-US',
					initImmediate: false,
					interpolation: {
						escapeValue: false
					}
				},
				fetchLanguage: async ({ guild }) => {
					if (guild) {
						const guildConfig = await this.db.fetchGuild(guild.id);
						return guildConfig.language;
					}

					return 'en-US';
				}
			},
			timeouts: new Discord.Collection()
		});
		this.db = require('./../../database/mongodb');

		this.fetchPrefix = fetchPrefix.bind(this);

		this.checkTimeCoolDown = checkTimeCoolDown.bind(this);
	}
}
module.exports = WynnClient;
