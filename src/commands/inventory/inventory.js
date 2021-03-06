const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const coolDown = require('../../config/cooldown');
const emoji = require('../../config/emoji');

const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

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
		try {
			let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
			}
			let input = await args.next();
			if (!['fish'].includes(input) && input !== null) {
				return;
			}
			const t = await fetchT(message);
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(message.author.id, this.name, coolDown.inventory.inv, t);
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
			return await this.mainProcess(message, t, message.author.id, message.author.tag, input);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async mainProcess(message, t, userId, tag, input) {
		switch (input) {
			case 'fish':
			default:
				const itemFish = await this.container.client.db.getItemFishByDiscordId(userId);
				let arrayFish = itemFish.arrayFish.slice();
				let maxCount = 1;
				// sort and get max
				let haveSwap = 0;
				for (let i = 0; i < arrayFish.length - 1; i++) {
					haveSwap = 0;
					for (let j = 0; j < arrayFish.length - 1 - i; j++) {
						if (arrayFish[j].amount > maxCount) maxCount = arrayFish[j].amount;
						if (arrayFish[j + 1].amount > maxCount) maxCount = arrayFish[j + 1].amount;
						if (arrayFish[j].id > arrayFish[j + 1].id) {
							swap(arrayFish, j, j + 1);
							haveSwap = 1;
						}
					}
					if (haveSwap === 0) {
						break;
					}
				}
				let digits = Math.trunc(Math.log10(maxCount) + 1);
				let allFish = '';
				for (let i = 0; i < arrayFish.length; i++) {
					allFish += `\`${arrayFish[i].id}\`${arrayFish[i].emoji}${utils.smallNumberDisplay(arrayFish[i].amount, digits)}   `;
					if (i > 1 && (i + 1) % 4 === 0) {
						allFish += '\n';
					}
				}
				return await utils.returnSlashAndMessage(
					message,
					t('commands/inventory:fish', {
						user: tag,
						baitAmount: utils.smallNumberDisplay(itemFish.bait, Math.trunc(Math.log10(itemFish.bait) + 1)),
						baitEmoji: emoji.collect.fishing.bait,
						arrayFish: allFish
					})
				);
		}
	}

	async execute(interaction) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
			}
			const t = await fetchT(interaction);
			const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, coolDown.inventory.inv, t);
			if (checkCoolDown) {
				return await interaction.reply(checkCoolDown);
			}
			return await this.mainProcess(interaction, t, interaction.user.id, interaction.user.tag, interaction.options.getSubcommand());
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
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
