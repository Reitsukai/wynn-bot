const { Events, Listener } = require('@sapphire/framework');
const { fetchT } = require('@sapphire/plugin-i18next');

class UserEvent extends Listener {
	constructor(context) {
		super(context, { event: Events.CommandDenied });
	}

	async run(error, { message }) {
		// silently fail owner only commands
		let timeOutCooldown;
		const t = await fetchT(message);
		if (error.identifier === 'OwnerOnly' || error.identifier === 'DisabledChannels') return null;

		if (error.identifier === 'preconditionCooldown') {
			timeOutCooldown = error.context.remaining;
			error.context = { ...error.context, remaining: `\`${(error.context.remaining / 1000).toFixed(2)}s\`` };
		}

		return message.channel
			.send(t(`preconditions:${error.identifier}`, { ...error.context, returnObjects: true, joinArray: ', ' }))
			.then((msg) => {
				if (error.identifier === 'preconditionCooldown') {
					setTimeout(() => {
						msg.delete();
					}, timeOutCooldown);
				}
			});
	}
}

exports.UserEvent = UserEvent;
