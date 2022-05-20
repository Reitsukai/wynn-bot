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
const blank = emoji.common.blank;
const maxBet = game.baucua.max;
const minBet = game.baucua.min;

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
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, 25000, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		let input1 = await args.next();
		if (input1 === 'config') {
			let input2 = await args.next();
			if (['tub', 'lake', 'river', 'sea'].includes(input2)) {
				return this.configLocation(interaction, t, input2);
			}
			// sai type return ...;
		}
		let userInfo = await this.container.client.db.fetchUser(message.author.id);
		return this.mainProcess(message, t, userInfo, message.author.id, message.author.tag);
	}

	async mainProcess(message, t, userInfo, userId, tag) {
		try {
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async configLocation(message, t, type) {
		return await this.container.client.db.updateUser(userId, {
			$inc: {
				money: money
			}
		});
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, 25000, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		if (interaction.options.getSubcommand() === 'config') {
			return this.configLocation(interaction, t, interaction.options.getString('location'));
		}
		let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
		return await this.mainProcess(interaction, t, userInfo, interaction.user.id, interaction.user.tag);
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
						.addChoice('tub', 'tub')
						.addChoice('lake', 'lake')
						.addChoice('river', 'river')
						.addChoice('sea', 'sea')
				)
		),
	UserCommand
};
