const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'ping',
			aliases: ['ping', 'pong'],
			description: 'commands/ping:description',
			usage: 'commands/ping:usage',
			example: 'commands/ping:example'
		});
	}

	async run(message) {
		const t = await fetchT(message);
		const msg = await send(message, t('commands/ping:before'));
		const content = t('commands/ping:after', {
			latency: Math.round(this.container.client.ws.ping),
			latency1: msg.createdTimestamp - message.createdTimestamp
		});
		return send(message, content);
	}
}

exports.UserCommand = UserCommand;
