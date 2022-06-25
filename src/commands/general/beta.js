const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'beta',
			aliases: ['beta'],
			description: 'commands/daily:description',
			usage: 'commands/daily:usage',
			example: 'commands/daily:example',
			cooldownDelay: 10000,
			enabled: false
		});
	}

	async messageRun(message) {
		const moneyEmoji = emoji.common.money;
		let userId = message.type === 'APPLICATION_COMMAND' ? message.user.id : message.author.id;
		let tag = message.type === 'APPLICATION_COMMAND' ? message.user.tag : message.author.tag;
		const betabotInfo = await this.container.client.db.getBetaBotInfo(userId);
		if (betabotInfo != null && betabotInfo.isClaim == true) {
			return utils.returnForSlashOrSendMessage(message, `**${tag}** đã nhận tiền để thử nghiệm beta bot`);
		}
		let moneyDaily = 50000;
		await this.container.client.db.updateUser(userId, {
			$inc: {
				money: moneyDaily
			}
		});
		await this.container.client.db.setBetaBotInfo(userId, {
			$set: { isClaim: true }
		});
		return utils.returnForSlashOrSendMessage(message, `**${tag}** nhận được ${moneyDaily} ${moneyEmoji} để thử nghiệm beta bot`);
	}

	async execute(interaction) {
		// return await interaction.reply(await this.messageRun(interaction));
		return await interaction.reply('Lệnh này đã bị tắt');
	}
}

module.exports = {
	data: new SlashCommandBuilder().setName('beta').setDescription('commands beta bot'),
	UserCommand
};
