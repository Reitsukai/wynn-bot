const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const { SlashCommandBuilder } = require('@discordjs/builders');

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

	async messageRun(message) {
		const t = await fetchT(message);
		const msg = await send(message, t('commands/ping:before'));
		const content = t('commands/ping:after', {
			latency: Math.round(this.container.client.ws.ping),
			latency1: msg.createdTimestamp - message.createdTimestamp
		});
		if (message.type === 'APPLICATION_COMMAND') {
			msg.delete();
			return content;
		}
		return send(message, content);
	}

	async execute(interaction) {
		return await interaction.reply(await this.messageRun(interaction));
	}
}

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Send ping request and check response times'),
	UserCommand
};
