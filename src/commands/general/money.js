const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const mUser = require('../../database/schema/user');
const emoji = require('../../config/emoji');
const { SlashCommandBuilder } = require('@discordjs/builders');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'money',
			aliases: ['money', 'currency', 'cash', 'credit', 'balance'],
			description: 'commands/money:description',
			usage: 'commands/money:usage',
			example: 'commands/money:example',
			cooldownDelay: 15000
		});
	}

	async messageRun(message) {
		const moneyEmoji = emoji.common.money;
		const t = await fetchT(message);
		if (message.type === 'APPLICATION_COMMAND') {
			const userInfo = await mUser.findOne({ discordId: message.user.id }).select(['money']);
			return t('commands/money:content', {
				money: userInfo.money,
				emoji: moneyEmoji
			});
		}
		const userInfo = await mUser.findOne({ discordId: message.author.id }).select(['money']);
		const content = t('commands/money:content', {
			money: userInfo.money,
			emoji: moneyEmoji
		});
		return send(message, content);
	}

	async execute(interaction) {
		return await interaction.reply(await this.messageRun(interaction));
	}
}

module.exports = {
	data: new SlashCommandBuilder().setName('money').setDescription('Check your money'),
	UserCommand
};
