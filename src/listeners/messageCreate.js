const { Listener } = require('@sapphire/framework');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'messageCreate'
		});
	}

	async run(message) {
		if (message.author.bot) return;
		if (!message.guild) return;

		let guildData;

		guildData = await this.container.client.db.fetchGuild(message.guild.id);

		if (!guildData) {
			guildData = await client.db.fetchGuild(message.guild.id);
		}
	}
}

exports.UserEvent = UserEvent;
