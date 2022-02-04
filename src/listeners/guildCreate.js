const { Listener } = require('@sapphire/framework');
const logger = require('../utils/logger');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: true,
			event: 'guildCreate'
		});
	}

	async run(guild) {
		try {
			// eslint-disable-next-line no-unused-vars
			const guildConfig = await this.container.client.db.fetchGuild(guild.id);
			console.log('Bot Has Joined Server, Saved To Database.');
		} catch (err) {
            logger.error(err);
		}
	}
}

exports.UserEvent = UserEvent;
