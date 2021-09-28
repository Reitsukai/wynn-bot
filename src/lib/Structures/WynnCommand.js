const { Command } = require('@sapphire/framework');

module.exports = class WynnCommand extends Command {
	constructor(context, { name, ...options }) {
		super(context, {
			...options,
			name: (name ?? context.name).toLowerCase()
		});
		this.usage = options.usage || '';
		this.example = options.example || [];
	}
};
