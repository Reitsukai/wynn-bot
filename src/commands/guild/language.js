const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');

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
		const t = await fetchT(message);
		const currentLanguage = await this.container.i18n.fetchLanguage(message);
		const arg = await args.pick('string').catch(() => null);

		const languageMap = this.container.i18n.languages;

		const langs = Array.from(languageMap.keys());

		if (!arg) {
			return await send(message, t('commands/language:currentLanguage', { language: currentLanguage }));
		}

		if (arg === 'list') {
			return await send(message, t('commands/language:listLanguage', { list: langs.join(', ') }));
		}

		const newCurrent = arg.split('-');
		const newLang = [newCurrent[0].toLowerCase(), newCurrent[1]?.toUpperCase()].join('-');

		if (newCurrent.length !== 2 || !langs.includes(newLang)) {
			return await send(message, t('commands/language:invalidInput', { prefix: await this.container.client.fetchPrefix(message) }));
		}

		try {
			const guildData = await this.container.client.db.updateGuild(message.guild.id, { language: newLang });

			if (guildData) {
				const newT = await fetchT(message);
				return send(message, newT('commands/language:updateLanguage', { newLanguage: newLang }));
			}
		} catch (err) {
			this.container.logger.error(err);
			return send(message, t('commands/language:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
