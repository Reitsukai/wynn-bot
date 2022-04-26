const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const game = require('../../config/game');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'lucky',
			aliases: ['lucky'],
			description: 'commands/lucky:description',
			usage: 'commands/lucky:usage',
			example: 'commands/lucky:example',
			cooldownDelay: 30000
		});
	}

	async messageRun(message, args) {
		try {
			const t = await fetchT(message);
			let input1 = await args.next();
			let input2 = await args.next();
			console.log(input1);
			console.log(input2);
			let userInfo = await this.container.client.db.fetchUser(message.author.id);
			let betMoney = input1 === 'all' ? userInfo.money : Number(input1);

			return await this.mainProcess(betMoney, arrayResult, t, message, message.author.tag, userInfo);
		} catch (error) {
			logger.error(err);
			console.log(error);
		}
	}

	async mainProcess(betMoney, input2, t, message, tag, userInfo) {
		if (userInfo.money - betMoney < 0) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lottery:nomoney', {
					user: tag
				})
			);
		}
		const regex = new RegExp('^([0-9]{2}-+)+$');
		if (!regex.test(input2 + '-') || isNaN(betMoney) || betMoney < 1) {
			await this.container.client.resetCustomCooldown(message.author.id, this.name);
			return send(
				message,
				t('commands/baucua:inputerror', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		let arrayBet = input2
			.split('-')
			.filter((n) => n)
			.map(Number);
		await this.container.client.db.addNewBetLucky(userInfo.discordId, betMoney, arrayBet);
		return await utils.returnSlashAndMessage(
			message,
			t('commands/lucky:result', {
				user: tag,
				arrayBet: arrayBet,
				betMoney: betMoney
			})
		);
	}

	async execute(interaction) {
		try {
			const t = await fetchT(interaction);
			if (interaction.options.getSubcommand() === 'results') {
				return this.embedResultLottery(interaction, t);
			}
			//no cooldown :3
			let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
			return await this.mainProcess(
				interaction.options.getInteger('betmoney'),
				interaction.options.getString('numbersequence'),
				t,
				interaction,
				interaction.user.tag,
				userInfo
			);
		} catch (error) {
			logger.error(err);
			console.log(error);
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lucky')
		.setDescription('lucky88')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('bet')
				.setDescription('Test your luck')
				.addIntegerOption((option) => option.setName('betmoney').setDescription('Enter an integer that is bet money').setRequired(true))
				.addStringOption((option) =>
					option.setName('numbersequence').setDescription('Enter the integer that is the number sequence you want').setRequired(true)
				)
		)
		.addSubcommand((subcommand) => subcommand.setName('results').setDescription('View number sequence results')),
	UserCommand
};
