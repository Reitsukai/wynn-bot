const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

const emoji = require('../../config/emoji');
const collect = require('../../config/collect');
const { MessageEmbed } = require('discord.js');
const moneyEmoji = emoji.common.money;
const blank = emoji.common.blank;
const locationFishing = collect.fishing;

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
				return this.configLocation(message, t, input2);
			}
			// sai type return ...;
		} else if (input1 === 'buy') {
			return this.buyBait(message, t);
		}
		return this.mainProcess(message, t, message.author.id, message.author.tag);
	}

	async mainProcess(message, t, userId, tag) {
		try {
			const itemFish = this.container.client.db.getItemFishByDiscordId(userId);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async configLocation(message, t, type) {}

	async buyBait(message, t) {}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, 25000, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		if (interaction.options.getSubcommand() === 'config') {
			return this.configLocation(interaction, t, interaction.options.getString('location'));
		} else if (interaction.options.getSubcommand() === 'buy') {
			return this.buyBait(interaction, t);
		}
		return await this.mainProcess(interaction, t, interaction.user.id, interaction.user.tag);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fishing')
		.setDescription('Fishing, fishing, fishing ...')
		.addSubcommand((subcommand) => subcommand.setName('now').setDescription('go to fishing now'))
		.addSubcommand((subcommand) => subcommand.setName('buy').setDescription('buy bait'))
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
