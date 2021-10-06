const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const mUser = require('../../database/schema/user');
const emoji = require('../../config/emoji');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'money',
			aliases: ['money', 'currency', 'cash', 'credit', 'balance'],
			description: 'commands/money:description',
			usage: 'commands/money:usage',
			example: 'commands/money:example'
		});
	}

	async run(message) {
		const moneyEmoji = emoji.common.money;

		const userInfo = await mUser.findOne({ discordId: message.author.id }).select(['money']);
		const t = await fetchT(message);
		const content = t('commands/money:content', {
			money: userInfo.money,
			emoji: moneyEmoji
		});
		return send(message, content);
	}
}

exports.UserCommand = UserCommand;
