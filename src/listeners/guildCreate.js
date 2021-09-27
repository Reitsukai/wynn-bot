const { Listener } = require('@sapphire/framework');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'guildCreate'
		});
	}

	async run(guild) {
		console.log(12);
		console.log(guild.id);
		try {
			const guildConfig = await this.container.client.db.fetchGuild(guild.id);
			console.log('Bot Has Joined Server, Saved To Database.');
		} catch (err) {
			console.log(err);
		}
	}
}

exports.UserEvent = UserEvent;
