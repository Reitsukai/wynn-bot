const { Listener } = require('@sapphire/framework');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'messageCreate'
		});
	}

	async run(message) {
		const t = await fetchT(message);
		if (message.author.bot) return;
		if (!message.guild) return;

		const prefix = await this.container.client.fetchPrefix(message);

		if (message.content.startsWith(`<@!${message.client.user.id}>`) || message.content.startsWith(`<@${message.client.user.id}>`)) {
			return message.reply({
				content: t('other:forgotPrefix', { prefix }),
				allowedMentions: { repliedUser: true }
			});
		}
	}
}

exports.UserEvent = UserEvent;
