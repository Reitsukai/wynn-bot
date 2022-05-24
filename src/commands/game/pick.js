const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const emoji = require('../../config/emoji');
const coolDown = require('../../config/cooldown');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'pick',
			aliases: ['pick'],
			description: 'commands/pick:description',
			usage: 'commands/pick:usage',
			example: 'commands/pick:example'
			// cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, coolDown.game.pick, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		let input = await args.next();
		let userInfo = await this.container.client.db.fetchUser(message.author.id);
		let pickmoney = input === 'all' ? userInfo.money : Number(input);
		//syntax check
		if (isNaN(pickmoney)) {
			await this.container.client.resetCustomCooldown(message.author.id, this.name);
			return send(
				message,
				t('commands/pick:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		return this.mainProcess(pickmoney, message, t, message.author.id, message.author.tag, userInfo);
	}

	async mainProcess(pickmoney, message, t, userId, tag, userInfo) {
		//validate bet money
		if (pickmoney < 1) {
			await this.container.client.resetCustomCooldown(userId, this.name);
			return await utils.returnSlashAndMessage(
				message,
				t('commands/pick:rangeerror', {
					user: tag,
					min: 1
				})
			);
		}

		try {
			const moneyEmoji = emoji.common.money;
			let channelInfo = await this.container.client.db.fetchChannel(message.channel.id);

			if (channelInfo.money - pickmoney < 0) {
				//rơi
				if (userInfo.money - pickmoney < 0) {
					if (userInfo.money < 0) {
						await this.container.client.resetCustomCooldown(userId, this.name);
						return await utils.returnSlashAndMessage(
							message,
							t('commands/pick:nomoney', {
								user: tag
							})
						);
					} else {
						await Promise.all([
							this.container.client.db.updateUser(userId, {
								money: 0
							}),
							this.container.client.db.updateChannel(channelInfo.channelId, {
								$inc: {
									money: userInfo.money
								}
							})
						]);
						return await utils.returnSlashAndMessage(
							message,
							t('commands/pick:fail', {
								user: tag,
								amount: userInfo.money,
								emoji: moneyEmoji
							})
						);
					}
				} else {
					await Promise.all([
						this.container.client.db.updateUser(userId, {
							$inc: {
								money: -pickmoney
							}
						}),
						this.container.client.db.updateChannel(channelInfo.channelId, {
							$inc: {
								money: pickmoney
							}
						})
					]);
					return await utils.returnSlashAndMessage(
						message,
						t('commands/pick:fail', {
							user: tag,
							amount: pickmoney,
							emoji: moneyEmoji
						})
					);
				}
			} else {
				//được
				await Promise.all([
					this.container.client.db.updateUser(userId, {
						$inc: {
							money: pickmoney
						}
					}),
					this.container.client.db.updateChannel(channelInfo.channelId, {
						$inc: {
							money: -pickmoney
						}
					})
				]);
				return await utils.returnSlashAndMessage(
					message,
					t('commands/pick:done', {
						user: tag,
						amount: pickmoney,
						emoji: moneyEmoji
					})
				);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, coolDown.game.pick, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
		return await this.mainProcess(
			Number(interaction.options.getInteger('pickmoney')),
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
		.setName('pick')
		.setDescription('pick money !!!')
		.addIntegerOption((option) => option.setName('pickmoney').setDescription('Enter an integer').setRequired(true)),
	UserCommand
};
