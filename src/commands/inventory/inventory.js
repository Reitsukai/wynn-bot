const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

const emoji = require('../../config/emoji');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'inventory',
			aliases: ['inventory', 'inv'],
			description: 'commands/inventory:description',
			usage: 'commands/inventory:usage',
			example: 'commands/inventory:example'
		});
	}

	async messageRun(message, args) {
		let input = await args.next();
		if (!['fish'].includes(input)) {
			return;
		}
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, 35000, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		return await this.mainProcess(message, t, message.author.id, message.author.tag, input);
	}

	async mainProcess(message, t, userId, tag, input) {
		try {
			switch (input) {
				case 'fish':
					const itemFish = await this.container.client.db.getItemFishByDiscordId(userId);
					let arrayFish = itemFish.arrayFish.slice();
					let maxCount = 1;
					// sort and get max
					for (let i = 0; i < arrayFish.length - 1; i++) {
						for (let j = 0; j < arrayFish.length - 1 - i; j++) {
							if (arrayFish[j].amount > maxCount) maxCount = arrayFish[j].amount;
							if (arrayFish[j].id > arrayFish[j + 1].id) {
								swap(arrayFish, j, j + 1);
							}
						}
					}
					let digits = Math.trunc(Math.log10(maxCount) + 1);
					let allFish = '';
					for (let i = 0; i < arrayFish.length; i++) {
						allFish += `\`${arrayFish[i].id}\`${arrayFish[i].emoji}${utils.smallNumberDisplay(arrayFish[i].amount, digits)}   `;
						if (i > 1 && i % 3 === 0) {
							allFish += '\n';
						}
					}
					return await utils.returnSlashAndMessage(
						message,
						t('commands/inventory:fish', {
							user: tag,
							baitAmount: utils.smallNumberDisplay(itemFish.bait, digits),
							baitEmoji: emoji.collect.fishing.bait,
							arrayFish: allFish
						})
					);
			}
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
		return await this.mainProcess(interaction, t, interaction.user.id, interaction.user.tag, interaction.options.getSubcommand());
	}
}

function swap(arr, xp, yp) {
	var temp = arr[xp];
	arr[xp] = arr[yp];
	arr[yp] = temp;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('view your inventory')
		.addSubcommand((subcommand) => subcommand.setName('fish').setDescription('view inventory fish')),
	UserCommand
};
