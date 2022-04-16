const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const mUser = require('../../database/schema/user');
const emoji = require('../../config/emoji');
const { MessageEmbed } = require('discord.js');
const { logger } = require('../../utils/index');
const utils = require('../../lib/utils');
const { SlashCommandBuilder } = require('@discordjs/builders');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'top',
			aliases: ['top', 'lb', 'leaderboard'],
			description: 'commands/top:description',
			usage: 'commands/top:usage',
			example: 'commands/top:example'
			// cooldownDelay: 35000
		});
	}

	async messageRun(message) {
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, 35000, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		return await this.mainProcess(message, t);
	}

	async mainProcess(message, t) {
		try {
			const moneyEmoji = emoji.common.money;

			const lbmoney = await mUser
				.find({ money: { $exists: true } })
				.sort({ money: -1 })
				.limit(10);
			let embedMSG = new MessageEmbed().setTitle('<<< Top 10 Money Rankings for server >>>');
			for (let i = 0; i < lbmoney.length; i++) {
				const user = await this.container.client.users.fetch(lbmoney[i].discordId);
				embedMSG.addField(`#${i + 1}. ${user.tag}`, `> ${lbmoney[i].money} ${moneyEmoji}`);
			}

			return await utils.returnForSlashOrSendMessage(message, { embeds: [embedMSG] });
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, 35000, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		return await interaction.reply(await this.mainProcess(interaction, t));
	}
}

module.exports = {
	data: new SlashCommandBuilder().setName('top').setDescription('View leaderboard'),
	UserCommand
};
