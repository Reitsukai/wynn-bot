const { Permissions } = require('discord.js');
const { err, ok, Precondition, UserError } = require('@sapphire/framework');

module.exports = class ClientPrecondition extends Precondition {
	async run(message) {
		const isAdmin = message.guild && message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
		return isAdmin ? ok() : err(new UserError({ identifier: 'AdminOnly' }));
	}
};
