const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const { SlashCommandBuilder } = require('@discordjs/builders');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'daily',
			aliases: ['daily'],
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
			const checkCoolDown = await this.container.client.checkTimeCoolDown(message.user.id, this.name, this.options.cooldownDelay, t);
			if (checkCoolDown) {
				return checkCoolDown;
			}
			const userInfo = await this.container.client.db.fetchUser(message.user.id);
			return t('commands/money:content', {
				tag: message.user.tag,
				money: userInfo.money,
				emoji: moneyEmoji
			});
		}
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, this.options.cooldownDelay, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		const userInfo = await this.container.client.db.fetchUser(message.author.id);
		const content = t('commands/money:content', {
			tag: message.author.tag,
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
