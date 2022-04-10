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
		let userInfo = await this.container.client.db.checkExistUser(message.author.id);
		if (userInfo != null) {
			return await this.container.client.db.updateUser(message.author.id, {
				$inc: {
					money: Math.floor(Math.random() * 10) + 1
				}
			});
		} else {
			return await this.container.client.db.fetchUser(message.author.id);
		}
	}
}

exports.UserEvent = UserEvent;
