const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const wait = require('node:timers/promises').setTimeout;

const game = require('../../config/game');
const emoji = require('../../config/emoji');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'slot',
			aliases: ['slot', 'sl', 's'],
			description: 'commands/slot:description',
			usage: 'commands/slot:usage',
			example: 'commands/slot:example',
			cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, this.options.cooldownDelay, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		let input = await args.next();
		let betMoney = input === 'all' ? maxBet : Number(input);
		let userInfo = await this.container.client.db.fetchUser(message.author.id);
		//syntax check
		if (isNaN(betMoney)) {
			return send(
				message,
				t('commands/slot:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		let result = await this.validateBetMoney(betMoney, message, t, userInfo, message.author.tag);
		if (result !== undefined) {
			return;
		}
		return this.mainProcess(betMoney, message, t, message.author.id, message.author.tag);
	}

	async validateBetMoney(betMoney, message, t, userInfo, tag) {
		const maxBet = game.slot.max;
		const minBet = game.slot.min;

		if (betMoney < minBet || betMoney > maxBet) {
			return await utils.returnForSlashWithLabelOrSendMessage(
				message,
				t('commands/slot:rangeerror', {
					user: tag,
					min: minBet,
					max: maxBet
				}),
				'end'
			);
		}

		if (userInfo.money - betMoney < 0) {
			return await utils.returnForSlashWithLabelOrSendMessage(
				message,
				t('commands/slot:nomoney', {
					user: tag
				}),
				'end'
			);
		}
	}

	async editSlotMsg(slotMsg, status, message, betMoney, tag, emoji1, emoji2, emoji3, emojiLoad, win, moneyEmoji, t, userId) {
		await this.container.client.db.updateUser(userId, {
			$inc: {
				money: win === 0 ? -betMoney : win
			}
		});

		let machine1 = t('commands/slot:process', {
			user: tag,
			icon1: emoji1,
			icon2: emojiLoad,
			icon3: emojiLoad,
			bet: betMoney,
			win: win,
			moneyEmoji: moneyEmoji
		});
		let machine2 = t('commands/slot:process', {
			user: tag,
			icon1: emoji1,
			icon2: emojiLoad,
			icon3: emoji3,
			bet: betMoney,
			win: win,
			moneyEmoji: moneyEmoji
		});
		let machine3 = t(status, {
			user: tag,
			icon1: emoji1,
			icon2: emoji2,
			icon3: emoji3,
			bet: betMoney,
			win: win,
			moneyEmoji: moneyEmoji
		});
		if (message.type === 'APPLICATION_COMMAND') {
			await message.reply(slotMsg);
			await wait(222);
			await message.editReply(machine1);
			await wait(333);
			await message.editReply(machine2);
			await wait(666);
			return await message.editReply(machine3);
		}
		await wait(222);
		await slotMsg.edit(machine1);
		await wait(333);
		await slotMsg.edit(machine2);
		await wait(666);
		return await slotMsg.edit(machine3);
	}

	async mainProcess(betMoney, message, t, userId, tag) {
		try {
			const moneyEmoji = emoji.common.money;
			const emojiLoad = emoji.game.slot.load;
			const emoji1 = emoji.game.slot.t1;
			const emoji2 = emoji.game.slot.t2;
			const emoji3 = emoji.game.slot.t3;

			let slotMsg = await utils.returnForSlashOrSendMessage(
				message,
				t('commands/slot:process', {
					icon1: emojiLoad,
					icon2: emojiLoad,
					icon3: emojiLoad
				})
			);

			let chance = Math.floor(Math.random() * 100) + 1; // 1->100
			let win = 0;

			if (chance <= 20) {
				// 20% 	x1 VVV
				win = betMoney;
				return await this.editSlotMsg(
					slotMsg,
					'commands/slot:win',
					message,
					betMoney,
					tag,
					emoji1,
					emoji1,
					emoji1,
					emojiLoad,
					win,
					moneyEmoji,
					t,
					userId
				);
			} else if (chance <= 40) {
				// 20% x2 OOO
				win = betMoney * 2;
				return await this.editSlotMsg(
					slotMsg,
					'commands/slot:win',
					message,
					betMoney,
					tag,
					emoji2,
					emoji2,
					emoji2,
					emojiLoad,
					win,
					moneyEmoji,
					t,
					userId
				);
			} else if (chance <= 45) {
				// 5% x5 ZZZ
				win = betMoney * 5;
				return await this.editSlotMsg(
					slotMsg,
					'commands/slot:win',
					message,
					betMoney,
					tag,
					emoji3,
					emoji3,
					emoji3,
					emojiLoad,
					win,
					moneyEmoji,
					t,
					userId
				);
			} else if (chance <= 46) {
				// 1% x10 VOZ
				win = betMoney * 10;
				return await this.editSlotMsg(
					slotMsg,
					'commands/slot:win',
					message,
					betMoney,
					tag,
					emoji1,
					emoji2,
					emoji3,
					emojiLoad,
					win,
					moneyEmoji,
					t,
					userId
				);
			} else {
				let arrayResult = [emoji1, emoji2, emoji3];
				let lost = [];
				while (lost.length < 3) {
					lost.push(arrayResult[Math.floor(Math.random() * arrayResult.length)]);
				}
				if (lost[0] === lost[1] && lost[1] === lost[2]) {
					//remove status in arrayResult
					arrayResult.splice(arrayResult.indexOf(lost[1]), 1);
					//reroll
					lost[Math.floor(Math.random() * 3)] = arrayResult[Math.floor(Math.random() * arrayResult.length)];
				} else if (lost[0] === emoji1 && lost[1] === emoji2 && lost[2] === emoji3) {
					let indexReroll = Math.floor(Math.random() * 3);
					arrayResult.splice(arrayResult.indexOf(lost[indexReroll]), 1);
					lost[indexReroll] = arrayResult[Math.floor(Math.random() * arrayResult.length)];
				}
				return await this.editSlotMsg(
					slotMsg,
					'commands/slot:lose',
					message,
					betMoney,
					tag,
					lost[0],
					lost[1],
					lost[2],
					emojiLoad,
					win,
					moneyEmoji,
					t,
					userId
				);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, this.options.cooldownDelay, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
		let result = await this.validateBetMoney(Number(interaction.options.getInteger('betmoney')), interaction, t, userInfo, interaction.user.tag);
		if (result !== undefined && result.status === 'end') {
			return await interaction.reply(result.content);
		}
		return await this.mainProcess(Number(interaction.options.getInteger('betmoney')), interaction, t, interaction.user.id, interaction.user.tag);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slot')
		.setDescription('Slot Machine !!!')
		.addIntegerOption((option) => option.setName('betmoney').setDescription('Enter an integer').setRequired(true)),
	UserCommand
};
