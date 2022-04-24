const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const emoji = require('../../config/emoji');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'drop',
			aliases: ['drop'],
			description: 'commands/drop:description',
			usage: 'commands/drop:usage',
			example: 'commands/drop:example'
			// cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, 15000, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		let input = await args.next();
		let userInfo = await this.container.client.db.fetchUser(message.author.id);
		let dropmoney = input === 'all' ? userInfo.money : Number(input);
		//syntax check
		if (isNaN(dropmoney)) {
			await this.container.client.resetCustomCooldown(message.author.id, this.name);
			return send(
				message,
				t('commands/drop:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		return this.mainProcess(dropmoney, message, t, message.author.id, message.author.tag, userInfo);
	}

	async mainProcess(dropmoney, message, t, userId, tag, userInfo) {
		//validate bet money
		if (dropmoney < 1) {
			await this.container.client.resetCustomCooldown(userId, this.name);
			return await utils.returnSlashAndMessage(
				message,
				t('commands/drop:rangeerror', {
					user: tag,
					min: 1
				})
			);
		}
		if (userInfo.money - dropmoney < 0) {
			await this.container.client.resetCustomCooldown(userId, this.name);
			return await utils.returnSlashAndMessage(
				message,
				t('commands/drop:nomoney', {
					user: tag
				})
			);
		}

		try {
			const moneyEmoji = emoji.common.money;
			let channelInfo = await this.container.client.db.fetchGuild(message.channel.id);
			await Promise.all([
				this.container.client.db.updateUser(userId, {
					$inc: {
						money: -dropmoney
					}
				}),
				this.container.client.db.updateChannel(channelInfo.channelId, {
					$inc: {
						money: dropmoney
					}
				})
			]);
			return await utils.returnSlashAndMessage(
				message,
				t('commands/drop:result', {
					user: tag,
					amount: dropmoney,
					emoji: moneyEmoji
				})
			);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, 15000, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
		return await this.mainProcess(
			Number(interaction.options.getInteger('dropmoney')),
			interaction,
			t,
			interaction.user.id,
			interaction.user.tag,
			userInfo
		);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drop')
		.setDescription('Drop money !!!')
		.addIntegerOption((option) => option.setName('dropmoney').setDescription('Enter an integer').setRequired(true)),
	UserCommand
};
