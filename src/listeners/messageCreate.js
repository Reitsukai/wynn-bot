const { Listener } = require('@sapphire/framework');
const levels = require('../utils/levels');
const verifyCaptcha = require('../utils/humanVerify/verifyCaptcha');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'messageCreate'
		});
	}

	async run(message) {
		if (message.author.bot) {
			return;
		}
		//type dms
		else if (!message.channel.guild) {
			return await verifyCaptcha(message, this.container.client);
		}
		// type guild
		else {
			await levels(message, this.container.client);
		}
	}
}

exports.UserEvent = UserEvent;
