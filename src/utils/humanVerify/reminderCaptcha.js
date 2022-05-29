const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');

module.exports = async function reminderCaptcha(message, client) {
	// type channel
	// get cache and check

	// reminder
	let captchaUser = await client.db.getCaptchaByDiscordId(message.author.id);
	const t = await fetchT(message);
	if (captchaUser.reminder > 5) {
		//ban
		await client.db.updateCaptcha(message.author.id, {
			wrong: 0,
			reminder: 0,
			isBlock: true,
			timeBlock: new Date(Date.now() + 10800000)
		});
		return await send(
			message,
			t('commands/captcha:ban', {
				user: message.author.tag
			})
		);
	}
	await client.db.updateCaptcha(message.author.id, {
		$inc: {
			reminder: 1
		}
	});
	return await send(
		message,
		t('commands/captcha:reminder', {
			user: message.author.tag,
			turn: captchaUser.reminder + 1
		})
	);
};
