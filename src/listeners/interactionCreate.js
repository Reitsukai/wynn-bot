const { Listener } = require('@sapphire/framework');
const logger = require('../utils/logger');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserEvent extends Listener {
	constructor(context) {
		super(context, {
			once: false,
			event: 'interactionCreate'
		});
	}

	async run(interaction) {
		if (!interaction.isCommand()) return;
		const command = this.container.stores.get('commands').get(interaction.commandName);
		if (!command) return;
		try {
			const getTimeout = this.container.client.options.timeouts.get(`${interaction.user.id}_${command.name}`) || 0;

			if (Date.now() - getTimeout < 0) {
				const t = await fetchT(interaction);
				return interaction.reply(
					t('preconditions:preconditionCooldown', {
						remaining: `\`${(getTimeout - Date.now()) / 1000}s\``
					})
				);
			}

			this.container.client.options.timeouts.set(`${interaction.user.id}_${command.name}`, Date.now() + (command.options.cooldownDelay || 0));
			command.execute(interaction);
		} catch (error) {
			logger.error(error);
		}
	}
}

exports.UserEvent = UserEvent;
