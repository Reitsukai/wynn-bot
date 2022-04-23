const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_money',
			description: 'add money to user',
			usage: 'wadd_money <id / @mention> <money> ',
			example: 'wadd_money 662508642251309057 100000'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
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

				await this.container.client.db.updateUser(mentionUser ? mentionUser.id : mentions, {
					$inc: {
						money: money
					}
				});
				logger.warn(`User: ${mentionUser ? mentionUser.id : mentions} | ${money} gold | By ${message.author.id}`);
				return message.channel.send('Success add ' + money);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
