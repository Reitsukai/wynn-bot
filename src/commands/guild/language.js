const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/index');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'language',
			description: 'commands/language:description',
			aliases: ['lg', 'lang'],
			usage: 'commands/language:usage',
			example: 'commands/language:example',
			preconditions: ['GuildOnly', ['AdminOnly']],
			cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const arg = await args.pick('string').catch(() => null);
		return this.mainProcess(arg, message);
	}

	async mainProcess(arg, message) {
		console.log(arg);
		const t = await fetchT(message);
		const currentLanguage = await this.container.i18n.fetchLanguage(message);
		const languageMap = this.container.i18n.languages;

		const langs = Array.from(languageMap.keys());

		if (!arg) {
			return await utils.returnForSlashOrSendMessage(message, t('commands/language:currentLanguage', { language: currentLanguage }));
		}

		if (arg === 'list') {
			return await utils.returnForSlashOrSendMessage(message, t('commands/language:listLanguage', { list: langs.join(', ') }));
		}

		const newCurrent = arg.split('-');
		const newLang = [newCurrent[0].toLowerCase(), newCurrent[1]?.toUpperCase()].join('-');

		if (newCurrent.length !== 2 || !langs.includes(newLang)) {
			return await utils.returnForSlashOrSendMessage(
				message,
				t('commands/language:invalidInput', { prefix: await this.container.client.fetchPrefix(message) })
			);
		}

		try {
			const guildData = await this.container.client.db.updateGuild(message.guild.id, { language: newLang });

			if (guildData) {
				const newT = await fetchT(message);
				return await utils.returnForSlashOrSendMessage(message, newT('commands/language:updateLanguage', { newLanguage: newLang }));
			}
		} catch (err) {
			logger.error(err);
			return send(message, t('commands/language:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		return await interaction.reply(await this.mainProcess(interaction.options.getString('language'), interaction));
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('language')
		.setDescription('Check language server')
		.addStringOption((option) =>
			option.setName('language').setDescription('Enter your language or type "list" to view all language').setRequired(false)
		),
	UserCommand
};
