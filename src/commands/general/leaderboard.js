const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const mUser = require('../../database/schema/user');
const emoji = require('../../config/emoji');
const { MessageEmbed } = require('discord.js');
const logger = require('../../utils/logger');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'top',
			aliases: ['top', 'lb', 'leaderboard'],
			description: 'commands/top:description',
			usage: 'commands/top:usage',
			example: 'commands/top:example',
			cooldownDelay: 15000
		});
	}

	async messageRun(message) {
		const t = await fetchT(message);
		try {
			const lbmoney = await mUser
				.find({ money: { $exists: true } })
				.sort({ money: -1 })
				.limit(10);
			let embedMSG = new MessageEmbed().setTitle('LeaderBoard Money');
			for (let i = 0; i < lbmoney.length; i++) {
				const user = await this.container.client.users.fetch(lbmoney[i].discordId);
				embedMSG.addField(`> ${user.tag}`, `${lbmoney[i].money}`);
			}

			return send(message, { embeds: [embedMSG] });
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
