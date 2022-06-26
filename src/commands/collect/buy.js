const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');
const coolDown = require('../../config/cooldown');
const collect = require('../../config/collect');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'buy',
			aliases: ['buy'],
			description: 'commands/buy:description',
			usage: 'commands/buy:usage',
			example: 'commands/buy:example'
		});
	}

	async messageRun(message, args) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
			}
			const t = await fetchT(message);
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(message.author.id, this.name, coolDown.collect.buy, t);
			if (checkCoolDown) {
				if (checkCoolDown.image !== undefined) {
					return await utils.sendCaptchaImage(
						message.author.id,
						this.container.client,
						checkCoolDown.image,
						checkCoolDown.text,
						message,
						t('commands/captcha:require', {
							user: message.author.tag
						})
					);
				}
				return send(message, checkCoolDown);
			}
			let input1 = await args.next();
			if (input1 === 'bait') {
				let userInfo = await this.container.client.db.fetchUser(message.author.id);
				let input2 = await args.next();
				if (input2 === null || isNaN(input2)) {
					input2 = 1;
				}
				return await this.buyBait(message, userInfo, t, input2, message.author.tag);
			}
			return;
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async buyBait(message, userInfo, t, amount, tag) {
		if (userInfo.money - collect.fishing.buy * amount < 0) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/buy:nomoney', {
					user: tag
				})
			);
		}
		await Promise.all([
			this.container.client.db.updateUser(userInfo.discordId, {
				$inc: {
					money: -collect.fishing.buy * amount
				}
			}),
			this.container.client.db.updateItemFish(userInfo.discordId, {
				$inc: {
					bait: amount === 0 ? 1 : amount
				}
			})
		]);
		return await utils.returnSlashAndMessage(
			message,
			t('commands/buy:baitdone', {
				user: tag,
				amount: amount
			})
		);
	}

	async execute(interaction) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
			}
			const t = await fetchT(interaction);
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(interaction.user.id, this.name, coolDown.collect.buy, t);
			if (checkCoolDown) {
				if (checkCoolDown.image !== undefined) {
					return await utils.sendCaptchaImage(
						interaction.user.id,
						this.container.client,
						checkCoolDown.image,
						checkCoolDown.text,
						interaction,
						t('commands/captcha:require', {
							user: interaction.user.tag
						})
					);
				}
				return await interaction.reply(checkCoolDown);
			}
			if (interaction.options.getSubcommand() === 'bait') {
				let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
				return await this.buyBait(interaction, userInfo, t, Number(interaction.options.getInteger('amount')), interaction.user.tag);
			}
			return;
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('buy some item')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('bait')
				.setDescription('buy bait for fishing')
				.addIntegerOption((option) => option.setName('amount').setDescription('Enter an integer').setRequired(true))
		),
	UserCommand
};
