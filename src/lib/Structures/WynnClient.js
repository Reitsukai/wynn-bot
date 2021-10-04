const { SapphireClient } = require('@sapphire/framework');

async function fetchPrefix(message) {
	const guild = await this.db.fetchGuild(message.guild.id);
	return guild.prefix;
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
			}
		});
		this.db = require('./../../database/mongodb');

		this.fetchPrefix = fetchPrefix.bind(this);
	}
}
module.exports = WynnClient;
