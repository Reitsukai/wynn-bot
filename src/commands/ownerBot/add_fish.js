const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_fish',
			description: 'add new fish',
			usage: 'wadd_fish <id> <name> <rarity> <emoji>',
			example: 'wadd_fish 100 frog normal 🐸'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
				const id = await args.next();
				const name = await args.next();
				const rarity = await args.next();
				const emoji = await args.next();
				if (name === null || rarity === null || id === null || isNaN(id) || emoji === null) {
					return message.channel.send('Error input');
				}
				await this.container.client.db.addNewFish(id, name, rarity, emoji);
				logger.warn(`User ${message.author.id} add new fish ... id: ${id} - name: ${name} - rarity: ${rarity} - emoji: ${emoji}`);
				return message.channel.send(`Success add new fish ... id: ${id} - name: ${name} - rarity: ${rarity} - emoji: ${emoji}`);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
