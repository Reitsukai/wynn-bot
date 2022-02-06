const { Command } = require('@sapphire/framework');

module.exports = class WynnCommand extends Command {
	constructor(context, { name, ...options }) {
		super(context, {
			...options,
			name: (name ?? context.name).toLowerCase(),
			requiredClientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS']
		});
		this.usage = options.usage || '';
		this.example = options.example || [];
	}
};
