const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const coolDown = require('../../config/cooldown');
const configSell = require('../../config/sell');
const collect = require('../../config/collect');
const { MessageEmbed } = require('discord.js');
const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'species',
			aliases: ['species', 'spec'],
			description: 'commands/species:description',
			usage: 'commands/species:usage',
			example: 'commands/species:example'
		});
	}

	async messageRun(message, args) {
		let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
		if (isBlock === true) return;
		if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
			return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
		}
		let input = await args.next();
		if (input === null) {
			return;
		}
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, coolDown.collect.species, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		return await this.mainProcess(message, t, input);
	}

	async mainProcess(message, t, input) {
		try {
			if (collect.fishing.allelement.includes(input)) {
				const infoFish = await this.container.client.db.getFishByName(input);
				let emoji = infoFish.emoji;
				let temp;
				if ((temp = emoji.match(/:[0-9]+>/))) {
					temp = 'https://cdn.discordapp.com/emojis/' + temp[0].match(/[0-9]+/)[0] + '.';
					if (emoji.match(/<a:/)) temp += 'gif';
					else temp += 'png';
					emoji = temp;
				} else {
					emoji = undefined;
				}
				let map = new Map();
				configSell.fishing.forEach((object) => {
					map.set(object.name, object.price);
				});
				let embedMSG = new MessageEmbed()
					.setTitle(`${infoFish.emoji} ${infoFish.name}`)
					.setDescription('`' + infoFish.description + '`')
					.setThumbnail(emoji)
					.addFields(
						{ name: t(`commands/species:name`), value: '`' + t(`commands/fishing:${infoFish.name}`) + '`' },
						{ name: t(`commands/species:rarity`), value: '`' + t(`commands/fishing:${infoFish.rarity}`) + '`' },
						{ name: t(`commands/species:price`), value: '`' + map.get(infoFish.name).toString() + '`' }
					);
				return await utils.returnSlashAndMessage(message, { embeds: [embedMSG] });
			} else {
				return await utils.returnSlashAndMessage(
					message,
					t(`commands/species:nospecies`, {
						input: input
					})
				);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
		if (isBlock === true) return;
		if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
			return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
		}
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, coolDown.collect.species, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		return await this.mainProcess(interaction, t, interaction.options.getString('name'));
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('species')
		.setDescription('view species')
		.addStringOption((option) => option.setName('name').setDescription('Enter name to view species').setRequired(true)),
	UserCommand
};
