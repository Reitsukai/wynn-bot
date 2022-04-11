const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

const game = require('../../config/game');
const emoji = require('../../config/emoji');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const moneyEmoji = emoji.common.money;
const dices = {
	bau: emoji.game.baucua.bau,
	cua: emoji.game.baucua.cua,
	ca: emoji.game.baucua.ca,
	ga: emoji.game.baucua.ga,
	tom: emoji.game.baucua.tom,
	nai: emoji.game.baucua.nai
};
const dice_icon = emoji.game.baucua.dice;
const cancel = emoji.common.tick_x;
const blank = emoji.common.blank;
const maxBet = game.baucua.max;
const minBet = game.baucua.min;

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'baucua',
			aliases: ['bc', 'baucua'],
			description: 'commands/baucua:description',
			usage: 'commands/baucua:usage',
			example: 'commands/baucua:example',
			cooldownDelay: 25000
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
				t('commands/baucua:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		let result = await this.validateBetMoney(betMoney, message, t, userInfo, message.author.tag);
		if (result !== undefined) {
			return;
		}
		return this.mainProcess(betMoney, message, t, userInfo, message.author.id, message.author.tag);
	}

	async validateBetMoney(betMoney, message, t, userInfo, tag) {
		if (betMoney < minBet || betMoney > maxBet) {
			return await utils.returnForSlashWithLabelOrSendMessage(
				message,
				t('commands/baucua:rangeerror', {
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
				t('commands/baucua:nomoney', {
					user: tag
				}),
				'end'
			);
		}
	}

	async mainProcess(betMoney, message, t, userInfo, userId, tag) {
		try {
			let numOfBet = [0, 0, 0, 0, 0, 0];
			//create message
			let embedMSG = new MessageEmbed()
				.setTitle(t('commands/baucua:title'))
				.setDescription(t('commands/baucua:descrp', { author: tag }))
				.addFields(
					{ name: t('commands/baucua:bau', { emo: dices.bau }), value: '0', inline: true },
					{ name: t('commands/baucua:cua', { emo: dices.cua }), value: '0', inline: true },
					{ name: t('commands/baucua:ca', { emo: dices.ca }), value: '0', inline: true },
					{ name: t('commands/baucua:ga', { emo: dices.ga }), value: '0', inline: true },
					{ name: t('commands/baucua:tom', { emo: dices.tom }), value: '0', inline: true },
					{ name: t('commands/baucua:nai', { emo: dices.nai }), value: '0', inline: true }
				)
				.addField(
					`${blank}`,
					t('commands/baucua:footer', {
						bet: betMoney,
						emoji: moneyEmoji
					})
				);
			const row = new MessageActionRow().addComponents(
				new MessageButton().setCustomId(`${dice_icon}`).setLabel(`${dice_icon}`).setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId(`${dices.bau}`)
					.setLabel(t('commands/baucua:bau', { emo: '' }))
					.setStyle('SECONDARY')
					.setEmoji(dices.bau),
				new MessageButton()
					.setCustomId(`${dices.cua}`)
					.setLabel(t('commands/baucua:cua', { emo: dices.cua }))
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId(`${dices.ca}`)
					.setLabel(t('commands/baucua:ca', { emo: dices.ca }))
					.setStyle('SECONDARY')
			);
			const row2 = new MessageActionRow().addComponents(
				new MessageButton().setCustomId(`${cancel}`).setLabel(`✖`).setStyle('DANGER'),
				new MessageButton()
					.setCustomId(`${dices.ga}`)
					.setLabel(t('commands/baucua:ga', { emo: dices.ga }))
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId(`${dices.tom}`)
					.setLabel(t('commands/baucua:tom', { emo: dices.tom }))
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId(`${dices.nai}`)
					.setLabel(t('commands/baucua:nai', { emo: dices.nai }))
					.setStyle('SECONDARY')
			);
			let newMsg = await send(message, { embeds: [embedMSG], components: [row, row2] });
			//bet and result
			const filter = (message) => {
				return (
					[dice_icon, cancel, dices.bau, dices.cua, dices.ca, dices.ga, dices.tom, dices.nai].includes(message.customId) &&
					message.user.id === userId
				);
			};

			const collector = newMsg.createMessageComponentCollector({ filter, time: 35000 });
			collector.on('collect', async (message) => {
				let status = 0;
				if (message.customId === cancel) {
					//cancel thì hoàn tiền
					collector.stop('done');

					this.saveBetResult(
						userId,
						numOfBet.reduce(function (a, b) {
							return a + b;
						}, 0)
					);

					await newMsg.delete();
					return;
				} else if (message.customId === dice_icon) {
					//quay
					collector.stop('done');
					// await newMsg.reactions.removeAll();
					let bet = 0;
					let win = null;
					let lose = null;
					for (var i in numOfBet) {
						bet += numOfBet[i];
					}
					let randDices = [];
					while (randDices.length < 3) {
						randDices.push(Math.floor(Math.random() * 6));
					}
					win = numOfBet[randDices[0]] * 2 + numOfBet[randDices[1]] * 2 + numOfBet[randDices[2]] * 2;
					//TH ra giống nhau
					if (randDices[0] == randDices[1] || randDices[0] == randDices[2]) win -= numOfBet[randDices[0]];
					if (randDices[1] == randDices[2]) win -= numOfBet[randDices[1]];
					if (win < bet) {
						lose = bet - win;
						win = null;
					}

					this.saveBetResult(userId, win !== null ? win : bet - lose);

					if (win != null) {
						embedMSG.setColor(0x78be5a);
						editBetMessage(
							embedMSG,
							numOfBet,
							t,
							t('commands/baucua:win', {
								author: tag,
								icon1: convertEmoji(randDices[0], dices),
								icon2: convertEmoji(randDices[1], dices),
								icon3: convertEmoji(randDices[2], dices),
								bet: bet,
								emoji: moneyEmoji,
								win: win
							})
						);
					} else {
						embedMSG.setColor(0xff0000);
						editBetMessage(
							embedMSG,
							numOfBet,
							t,
							t('commands/baucua:lose', {
								author: tag,
								icon1: convertEmoji(randDices[0], dices),
								icon2: convertEmoji(randDices[1], dices),
								icon3: convertEmoji(randDices[2], dices),
								bet: bet,
								emoji: moneyEmoji,
								lose: lose
							})
						);
					}
					// let resultMsg = createResultMessage(message, bet, win, lose, randDices, dices, numOfBet, moneyEmoji, t);
					// await newMsg.edit({ embeds: [embedMSG] });
					await message.update({ embeds: [embedMSG], components: [] });
					return;
				} else {
					userInfo = await this.container.client.db.fetchUser(userId);
					//check money
					if (userInfo.money < betMoney) {
						//numOfBet[status] -= betMoney; //reset ve trang thai cu
						//this.saveBetResult(userId, betMoney);
						embedMSG.setFooter({ text: t('commands/baucua:nomoney', { user: tag }) });
						row.components.forEach((e) => {
							if (e.customId !== dice_icon) {
								e.setDisabled(true);
							}
						});
						row2.components.forEach((e) => {
							if (e.customId !== cancel) {
								e.setDisabled(true);
							}
						});
						await message.update({ embeds: [embedMSG], components: [row, row2] });
					} else {
						//thay doi
						switch (message.customId) {
							case dices.bau:
								numOfBet[0] += betMoney;
								status = 0;
								break;
							case dices.cua:
								numOfBet[1] += betMoney;
								status = 1;
								break;
							case dices.ca:
								numOfBet[2] += betMoney;
								status = 2;
								break;
							case dices.ga:
								numOfBet[3] += betMoney;
								status = 3;
								break;
							case dices.tom:
								numOfBet[4] += betMoney;
								status = 4;
								break;
							case dices.nai:
								numOfBet[5] += betMoney;
								status = 5;
								break;
						}
						// await reaction.users.remove(userId);
						this.saveBetResult(userId, -betMoney);
						editBetMessage(embedMSG, numOfBet, t, null);
						// await newMsg.edit({ embeds: [embedMSG] });
						await message.update({ embeds: [embedMSG] });
					}
				}
			});
			//hết giờ thì cancel
			collector.on('end', async (collected, reason) => {
				if (reason == 'time') {
					this.saveBetResult(
						userId,
						numOfBet.reduce(function (a, b) {
							return a + b;
						}, 0)
					);

					embedMSG.setColor(0xffd700);
					embedMSG.setFooter({ text: t('commands/baucua:notactive') });
					await newMsg.edit({ embeds: [embedMSG] });
					// await message.update({ embeds: [embedMSG], components: [row, row2] });
					return;
				}
			});
			return;
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async saveBetResult(userId, money) {
		return await this.container.client.db.updateUser(userId, {
			$inc: {
				money: money
			}
		});
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
		await interaction.reply(t('commands/baucua:description'));
		return await this.mainProcess(
			Number(interaction.options.getInteger('betmoney')),
			interaction,
			t,
			userInfo,
			interaction.user.id,
			interaction.user.tag
		);
	}
}

function editBetMessage(embedMSG, numOfBet, t, msgResult) {
	if (msgResult !== null) {
		embedMSG.setFields(
			{ name: t('commands/baucua:bau', { emo: dices.bau }), value: numOfBet[0].toString(), inline: true },
			{ name: t('commands/baucua:cua', { emo: dices.cua }), value: numOfBet[1].toString(), inline: true },
			{ name: t('commands/baucua:ca', { emo: dices.ca }), value: numOfBet[2].toString(), inline: true },
			{ name: t('commands/baucua:ga', { emo: dices.ga }), value: numOfBet[3].toString(), inline: true },
			{ name: t('commands/baucua:tom', { emo: dices.tom }), value: numOfBet[4].toString(), inline: true },
			{ name: t('commands/baucua:nai', { emo: dices.nai }), value: numOfBet[5].toString(), inline: true },
			{ name: `${blank}`, value: msgResult, inline: false }
		);
	} else {
		embedMSG.setFields(
			{ name: t('commands/baucua:bau', { emo: dices.bau }), value: numOfBet[0].toString(), inline: true },
			{ name: t('commands/baucua:cua', { emo: dices.cua }), value: numOfBet[1].toString(), inline: true },
			{ name: t('commands/baucua:ca', { emo: dices.ca }), value: numOfBet[2].toString(), inline: true },
			{ name: t('commands/baucua:ga', { emo: dices.ga }), value: numOfBet[3].toString(), inline: true },
			{ name: t('commands/baucua:tom', { emo: dices.tom }), value: numOfBet[4].toString(), inline: true },
			{ name: t('commands/baucua:nai', { emo: dices.nai }), value: numOfBet[5].toString(), inline: true },
			{ name: `${blank}`, value: `${blank}`, inline: false }
		);
	}
}

function convertEmoji(x, dices) {
	if (x == 0) return dices.bau;
	if (x == 1) return dices.cua;
	if (x == 2) return dices.ca;
	if (x == 3) return dices.ga;
	if (x == 4) return dices.tom;
	if (x == 5) return dices.nai;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('baucua')
		.setDescription('Game Fish 🐟 Shrimp 🦐 Crab 🦀')
		.addIntegerOption((option) => option.setName('betmoney').setDescription('Enter an integer').setRequired(true)),
	UserCommand
};
