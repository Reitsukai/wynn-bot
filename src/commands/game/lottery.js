const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const game = require('../../config/game');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'lottery',
			aliases: ['lottery'],
			description: 'commands/lottery:description',
			usage: 'commands/lottery:usage',
			example: 'commands/lottery:example',
			cooldownDelay: 30000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);

		let input = await args.next();

		let typeDigit;
		let code;
		if (input !== null) {
			if (typeof input === 'string' || input instanceof String) {
				if (input === '2d' || input === '3d' || input === '4d' || input === '5d') {
					typeDigit = parseInt(input.charAt(0));
				} else if (!isNaN(Number(input))) {
					code = Number(input);
				}
			} else {
				//input error
				return send(
					message,
					t('commands/lottery:inputerror', {
						user: message.author.tag,
						prefix: await this.container.client.fetchPrefix(message)
					})
				);
			}
		}
		let userInfo = await this.container.client.db.fetchUser(message.author.id);
		return await this.mainProcess(typeDigit, code, t, message, message.author.tag, userInfo);
	}

	async mainProcess(typeDigit, code, t, message, tag, userInfo) {
		if (userInfo.money - game.lottery.buy < 0) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lottery:nomoney', {
					user: tag
				})
			);
		}
		const mapLength = new Map();
		mapLength.set(2, 100);
		mapLength.set(3, 900);
		mapLength.set(4, 9000);
		mapLength.set(5, 90000);
		//case 1 : find code
		if (code !== null && code !== undefined) {
			for (let i = 0; i < this.container.client.options.lottery.length; i++) {
				if (this.container.client.options.lottery[i].length === mapLength.get(code.toString().length === 1 ? 2 : code.toString().length)) {
					let location = this.container.client.options.lottery[i].indexOf(code);
					if (location === -1) {
						//exist
						return await utils.returnSlashAndMessage(
							message,
							t('commands/lottery:exist', {
								code: code,
								tag: tag
							})
						);
					} else {
						//ok
						if (message.type === 'APPLICATION_COMMAND') {
							await message.reply(t('commands/lottery:description'));
						}
						return await this.embedConfirm(code, t, message, tag, userInfo.discordId, null, location, i);
					}
				}
			}
		}
		//case 2 : find by typedigit
		else if (typeDigit) {
			const lotteryResult = await this.container.client.db.getLotteryResultByType(typeDigit);
			let count = lotteryResult.counter;
			if (count === mapLength.get(typeDigit) - 1) {
				// sold out this type
				return await utils.returnSlashAndMessage(
					message,
					t('commands/lottery:sold', {
						type: typeDigit + 'd',
						tag: tag
					})
				);
			}
			let codeByType;
			for (let i = 0; i < this.container.client.options.lottery.length; i++) {
				if (this.container.client.options.lottery[i].length === mapLength.get(typeDigit)) {
					while (this.container.client.options.lottery[i][count] === -1) {
						count++;
					}
					codeByType = this.container.client.options.lottery[i][count];
					//ok
					if (message.type === 'APPLICATION_COMMAND') {
						await message.reply(t('commands/lottery:description'));
					}
					return await this.embedConfirm(codeByType, t, message, tag, userInfo.discordId, lotteryResult, count, i);
				}
			}
		}
		//case 3: random
		else {
			for (let typeJ = 5; typeJ > 1; typeJ--) {
				const lotteryResult = await this.container.client.db.getLotteryResultByType(typeJ);
				let count = lotteryResult.counter;
				if (count === mapLength.get(typeJ) - 1) {
					continue;
				}
				let codeByType;
				for (let i = 0; i < this.container.client.options.lottery.length; i++) {
					if (this.container.client.options.lottery[i].length === mapLength.get(typeJ)) {
						while (this.container.client.options.lottery[i][count] === -1) {
							count++;
						}
						codeByType = this.container.client.options.lottery[i][count];
						//ok
						if (message.type === 'APPLICATION_COMMAND') {
							await message.reply(t('commands/lottery:description'));
						}
						return await this.embedConfirm(codeByType, t, message, tag, userInfo.discordId, lotteryResult, count, i);
					}
				}
			}
			// sold out all
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lottery:soldout', {
					tag: tag
				})
			);
		}
	}

	async embedConfirm(code, t, message, tag, userId, lotteryResult, count, index) {
		const moneyEmoji = emoji.common.money;
		const blank = emoji.common.blank;
		let embedMSG = new MessageEmbed().setTitle(t('commands/lottery:title', { tag: tag })).addField(
			`${blank}`,
			t('commands/lottery:content', {
				code: code,
				type: code.toString().length === 1 ? 2 : code.toString().length + 'd',
				price: game.lottery.buy,
				emoji: moneyEmoji
			})
		);
		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('accept').setLabel(t('commands/lottery:accept')).setStyle('SUCCESS'),
			new MessageButton().setCustomId('cancel').setLabel(t('commands/lottery:cancel')).setStyle('DANGER')
		);
		let newMsg = await send(message, { embeds: [embedMSG], components: [row] });
		const filter = (message) => {
			return ['accept', 'cancel'].includes(message.customId) && message.user.id === userId;
		};
		const collector = newMsg.createMessageComponentCollector({ filter, time: 15000 });
		collector.on('collect', async (message) => {
			if (message.customId === 'accept') {
				if (lotteryResult) {
					await this.container.client.db.updateCountLotteryResult(lotteryResult._id, count);
				}
				this.container.client.options.lottery[index][count] = -1;
				await Promise.all([
					this.container.client.db.updateUser(userId, {
						$inc: {
							money: -game.lottery.buy
						}
					}),
					this.container.client.db.createNewLottery(userId, code)
				]);
				// row.components.forEach((e) => {
				// 	e.setDisabled(true);
				// });
				embedMSG.setColor(0x78be5a);
				embedMSG.setFooter({ text: t('commands/lottery:acceptbuy') });
				await newMsg.edit({ embeds: [embedMSG], components: [] });
				collector.stop('done');
				return;
			} else if (message.customId === 'cancel') {
				// row.components.forEach((e) => {
				// 	e.setDisabled(true);
				// });
				embedMSG.setColor(0xffd700);
				embedMSG.setFooter({ text: t('commands/lottery:cancelbuy') });
				await newMsg.edit({ embeds: [embedMSG], components: [] });
				collector.stop('done');
				return;
			}
		});
		collector.on('end', async (collected, reason) => {
			if (reason == 'time') {
				embedMSG.setColor(0xffd700);
				embedMSG.setFooter({ text: t('commands/lottery:notactive') });
				row.components.forEach((e) => {
					e.setDisabled(true);
				});
				await newMsg.edit({ embeds: [embedMSG], components: [row] });
				return;
			}
		});
		return;
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		//no cooldown :3
		let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
		return await this.mainProcess(
			interaction.options.getInteger('type'),
			interaction.options.getInteger('code'),
			t,
			interaction,
			interaction.user.tag,
			userInfo
		);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lottery')
		.setDescription('lottery for lucky')
		.addIntegerOption((option) =>
			option
				.setName('type')
				.setDescription('Enter an integer that is the length of the lottery code')
				.setRequired(false)
				.addChoice('two-digit type', 2)
				.addChoice('three-digit type', 3)
				.addChoice('four-digit type', 4)
				.addChoice('five-digit type', 5)
		)
		.addIntegerOption((option) =>
			option.setName('code').setDescription('Enter the integer that is the lottery number you want').setRequired(false)
		),
	UserCommand
};
