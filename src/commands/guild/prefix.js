const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/index');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { Permissions } = require('discord.js');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'prefix',
			description: 'commands/prefix:description',
			aliases: ['prefix'],
			usage: 'commands/prefix:usage',
			example: 'commands/prefix:example',
			preconditions: ['GuildOnly', ['AdminOnly']],
			cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const prefix = await args.pick('string').catch(() => null);
		return this.mainProcess(message, prefix);
	}

	async mainProcess(message, prefix) {
		const t = await fetchT(message);
		const currentPrefix = await this.container.client.fetchPrefix(message);

		if (!prefix) {
			return await utils.returnForSlashOrSendMessage(message, t('commands/prefix:currentPrefix', { prefix: currentPrefix }));
		}

		try {
			const guildData = await this.container.client.db.updateGuild(message.guild.id, { prefix: prefix });

			if (guildData) {
				return await utils.returnForSlashOrSendMessage(message, t('commands/prefix:updatePrefix', { newPrefix: prefix }));
			}
		} catch (err) {
			logger.error(err);
			return send(message, t('commands/prefix:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async execute(interaction) {
		if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return await interaction.reply(await this.mainProcess(interaction, interaction.options.getString('prefix')));
		}
		const t = await fetchT(interaction);
		return interaction.reply(t('preconditions:AdminOnly'));
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Check or set your prefix server')
		.addStringOption((option) => option.setName('prefix').setDescription('Enter your prefix to set').setRequired(false)),
	UserCommand
};
