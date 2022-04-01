const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const mUser = require('../../database/schema/user');
const emoji = require('../../config/emoji');
const logger = require('../../utils/logger');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'give_money',
			aliases: ['give_money', 'give_currency', 'give_cash', 'give_credit', 'give_balance', 'give'],
			description: 'commands/give_money:description',
			usage: 'commands/give_money:usage',
			example: 'commands/give_money:example',
			cooldownDelay: 10000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const moneyEmoji = emoji.common.money;
		try {
			const userMoney = await mUser.findOne({ discordId: message.author.id }).select(['money']);
			let mentionUser = message.mentions.users.first();
			let userInfo = null;
			const mentions = await args.next();
			const money = await args.next();

			if (!mentionUser) {
				userInfo = await this.container.client.db.checkExistUser(mentions);
			} else {
				userInfo = await this.container.client.db.checkExistUser(mentionUser.id);
			}

			if (!userInfo) {
				return message.channel.send('Cannot find user');
			}

			if (!money || !Number.isInteger(parseInt(money))) {
				return message.channel.send('Error money input');
			}

			if (userMoney.money < money) {
				return message.channel.send('Not enough money');
			}

			await this.container.client.db.updateUser(mentionUser ? mentionUser.id : mentions, {
				$inc: {
					money: money
				}
			});

			return message.channel.send('Success add ' + money);
			// const content = t('commands/money:content', {
			//     money: userInfo.money,
			//     emoji: moneyEmoji
			// });
			// return send(message, content);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
