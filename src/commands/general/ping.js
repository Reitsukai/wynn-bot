const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			description: 'ping pong'
		});
	}

	async run(message) {

		const t = await fetchT(message);
		const msg = await send(message, t('commands/ping:before'));
		const content = t('commands/ping:after', { latency: Math.round(this.container.client.ws.ping), latency1: msg.createdTimestamp - message.createdTimestamp })

		return send(message, content);
	}
}

exports.UserCommand = UserCommand;
