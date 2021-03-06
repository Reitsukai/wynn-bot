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
			name: 'fishing',
			aliases: ['fishing', 'f'],
			description: 'commands/fishing:description',
			usage: 'commands/fishing:usage',
			example: 'commands/fishing:example'
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
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(
				message.author.id,
				this.name,
				coolDown.collect.fishing,
				t
			);
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
			if (input1 === 'config') {
				let input2 = await args.next();
				if (['tub', 'lake', 'river', 'sea'].includes(input2)) {
					return await Promise.all([
						this.container.client.resetCustomCooldown(message.author.id, this.name),
						this.configLocation(message, t, message.author.id, input2, message.author.tag)
					]);
				}
				// sai type return ...;
			}
			return await this.mainProcess(message, t, message.author.id, message.author.tag);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async mainProcess(message, t, userId, tag) {
		const itemFish = await this.container.client.db.getItemFishByDiscordId(userId);
		if (itemFish.bait < 1) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/fishing:nobait', {
					user: tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		const locationFishing = collect.fishing;
		let map = new Map();
		map.set('tub', locationFishing.tub);
		map.set('lake', locationFishing.lake);
		map.set('river', locationFishing.river);
		map.set('sea', locationFishing.sea);
		let random = Math.random();
		let resultFishing = '';
		let arrayRate = map.get(itemFish.location);
		for (let i = 0; i < arrayRate.length; i++) {
			if (random <= arrayRate[i].rate) {
				resultFishing = arrayRate[i].name;
				break;
			}
		}
		if (resultFishing === 'fail') {
			await this.container.client.db.updateItemFish(userId, {
				$inc: {
					bait: -1
				}
			});
			return await utils.returnSlashAndMessage(
				message,
				t('commands/fishing:fishingfail', {
					user: tag
				})
			);
		}
		let fishReceive = await this.container.client.db.getFishByName(resultFishing);
		let newArray = itemFish.arrayFish.slice();
		let flag = 0;
		for (let i = 0; i < newArray.length; i++) {
			if (newArray[i].id === fishReceive.id) {
				newArray[i].amount += 1;
				flag = 1;
				break;
			}
		}
		if (flag === 0) {
			newArray.push({
				id: fishReceive.id,
				name: fishReceive.name,
				emoji: fishReceive.emoji,
				amount: 1
			});
		}

		await this.container.client.db.updateItemFish(userId, {
			$inc: {
				bait: -1
			},
			arrayFish: newArray
		});
		return await utils.returnSlashAndMessage(
			message,
			// 'T??nh n??ng ??ang b???o tr?? t???m th???i'
			t('commands/fishing:fishingdone', {
				user: tag,
				name: collect.fishing.special.includes(fishReceive.name) ? `${fishReceive.name}` : t(`commands/fishing:${fishReceive.name}`),
				emoji: fishReceive.emoji,
				rarity: t(`commands/fishing:${fishReceive.rarity}`)
			})
		);
	}

	async configLocation(message, t, userId, type, tag) {
		await this.container.client.db.updateItemFish(userId, {
			location: type
		});
		return await utils.returnSlashAndMessage(
			message,
			t('commands/fishing:config', {
				user: tag,
				location: t(`commands/fishing:${type}`)
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
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(
				interaction.user.id,
				this.name,
				coolDown.collect.fishing,
				t
			);
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
			if (interaction.options.getSubcommand() === 'config') {
				return await this.configLocation(
					interaction,
					t,
					interaction.user.id,
					interaction.options.getString('location'),
					interaction.user.tag
				);
			}
			return await this.mainProcess(interaction, t, interaction.user.id, interaction.user.tag);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fishing')
		.setDescription('Fishing, fishing, fishing ...')
		.addSubcommand((subcommand) => subcommand.setName('now').setDescription('go to fishing now'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('config')
				.setDescription('config location')
				.addStringOption((option) =>
					option
						.setName('location')
						.setDescription('Enter location to fishing')
						.setRequired(true)
						.addChoices(
							{ name: 'tub', value: 'tub' },
							{ name: 'lake', value: 'lake' },
							{ name: 'river', value: 'river' },
							{ name: 'sea', value: 'sea' }
						)
				)
		),
	UserCommand
};
