const { Listener } = require('@sapphire/framework');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'messageCreate'
		});
	}

	async run(message) {
		if (message.author.bot || !message.channel.guild) return;
		// exist -> if yes update else create
		return await this.container.client.db.upsertUser(message.author.id, {
			$inc: {
				money: Math.floor(Math.random() * 10) + 1
			}
		});
	}
}

exports.UserEvent = UserEvent;
