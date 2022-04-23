const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { Permissions } = require('discord.js');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'language',
			description: 'commands/language:description',
			aliases: ['lg', 'lang'],
			usage: 'commands/language:usage',
			example: 'commands/language:example',
			preconditions: ['GuildOnly', ['AdminOnly']]
			// cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, 10000, t);
		if (checkCoolDown) {
			return send(message, checkCoolDown);
		}
		const arg = await args.pick('string').catch(() => null);
		return this.mainProcess(arg, message, t);
	}

	async mainProcess(arg, message, t) {
		const currentLanguage = await this.container.i18n.fetchLanguage(message);
		const languageMap = this.container.i18n.languages;

		const langs = Array.from(languageMap.keys());

		if (!arg) {
			return await utils.returnContentForSlashOrSendMessage(message, t('commands/language:currentLanguage', { language: currentLanguage }));
		}

		if (arg === 'list') {
			return await utils.returnContentForSlashOrSendMessage(message, t('commands/language:listLanguage', { list: langs.join(', ') }));
		}

		const newCurrent = arg.split('-');
		const newLang = [newCurrent[0].toLowerCase(), newCurrent[1]?.toUpperCase()].join('-');

		if (newCurrent.length !== 2 || !langs.includes(newLang)) {
			return await utils.returnContentForSlashOrSendMessage(
				message,
				t('commands/language:invalidInput', { prefix: await this.container.client.fetchPrefix(message) })
			);
		}

		try {
			const guildData = await this.container.client.db.updateGuild(message.guild.id, { language: newLang });

			if (guildData) {
				const newT = await fetchT(message);
				return await utils.returnContentForSlashOrSendMessage(message, newT('commands/language:updateLanguage', { newLanguage: newLang }));
			}
		} catch (err) {
			logger.error(err);
			return send(message, t('commands/language:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		const t = await fetchT(interaction);
		const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, 10000, t);
		if (checkCoolDown) {
			return await interaction.reply(checkCoolDown);
		}
		if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return await interaction.reply(await this.mainProcess(interaction.options.getString('language'), interaction, t));
		}
		return await interaction.reply(t('preconditions:AdminOnly'));
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('language')
		.setDescription('Check or set your language server')
		.addStringOption((option) =>
			option
				.setName('language')
				.setDescription('Enter your language to set')
				.setRequired(false)
				.addChoice('Tiếng Việt', 'vi-VN')
				.addChoice('English - US', 'en-US')
		),
	UserCommand
};
