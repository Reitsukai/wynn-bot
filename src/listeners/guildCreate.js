const { Listener } = require('@sapphire/framework');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: true,
			event: 'guildCreate'
		});
	}

	async run(guild) {
		try {
			const guildConfig = await this.container.client.db.fetchGuild(guild.id);
			console.log('Bot Has Joined Server, Saved To Database.');
		} catch (err) {
			console.log(err);
		}
	}
}

exports.UserEvent = UserEvent;
