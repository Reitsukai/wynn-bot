const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_money',
			description: 'add money to user',
			usage: 'wadd_money <id / @mention> <money> ',
			example: 'wadd_money 662508642251309057 100000',
		});
	}

	async run(message, args) {
		if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
			const t = await fetchT(message);
			let mentionUser = message.mentions.users.first();
			let userInfo = null;
			const mentions = await args.next();
			const money = await args.next();
///->>> mai fix			//lỗi check input & find user
			if(!mentionUser){
				userInfo = await this.container.client.db.fetchUser(mentions);
			}
			else {
				userInfo = await this.container.client.db.fetchUser(mentionUser.id);
			}

			if(!userInfo){
				return message.channel.send('Cannot find user');
			}

			if(!money){
				return message.channel.send('Error money input');
			}

			try {
				await this.container.client.db.updateUser(
					mentionUser ? mentionUser.id : mentions, 
					{
					$inc: {
						money: money
					}
				});

				return message.channel.send('Success add ' + money);
			} catch {
				return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
			}
		}

	}
}

exports.UserCommand = UserCommand;
