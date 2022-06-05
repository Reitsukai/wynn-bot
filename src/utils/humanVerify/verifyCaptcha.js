const { send } = require('@sapphire/plugin-editable-commands');

module.exports = async function verifyCaptcha(message, client) {
	let captchaUser = await client.db.getCaptchaByDiscordId(message.author.id);
	if (captchaUser === null || captchaUser.isBlock === true || captchaUser.isResolve === true) {
		return;
	} else if (captchaUser.deadline < Date.now()) {
		//ban
		await client.db.updateCaptcha(message.author.id, {
			wrong: 0,
			reminder: 0,
			isBlock: true,
			timeBlock: new Date(Date.now() + 10800000 * Math.pow(2, captchaUser.amount)),
			$inc: {
				amount: 1
			}
		});
		client.options.spamTime.set(`${message.author.id}`, 0);
		client.options.spams.set(`${message.author.id}`, 0);
		return await send(
			message,
			`☠ ${message.author.username} ! You have been banned for ${3 * Math.pow(2, captchaUser.amount)}H for macros or botting!`
		);
	} else if (captchaUser.captcha === message.content) {
		// ok
		client.options.spamTime.set(`${message.author.id}`, 0);
		client.options.spams.set(`${message.author.id}`, 0);
		await client.db.updateCaptcha(message.author.id, {
			isResolve: true,
			timeResolve: new Date(Date.now()),
			wrong: 0,
			reminder: 0
		});
		return await send(message, '😊 I have verified that you are human! Thank you');
	} else {
		if (captchaUser.wrong > 2) {
			//ban
			await client.db.updateCaptcha(message.author.id, {
				wrong: 0,
				reminder: 0,
				isBlock: true,
				timeBlock: new Date(Date.now() + 10800000 * Math.pow(2, captchaUser.amount)),
				$inc: {
					amount: 1
				}
			});
			client.options.spamTime.set(`${message.author.id}`, 0);
			client.options.spams.set(`${message.author.id}`, 0);
			return await send(
				message,
				`☠ ${message.author.username} ! You have been banned for ${3 * Math.pow(2, captchaUser.amount)}H for macros or botting!`
			);
		}
		await client.db.updateCaptcha(message.author.id, {
			$inc: {
				wrong: 1
			}
		});
		return await send(message, `🚫 Wrong verification code! Please try again (${captchaUser.wrong + 1}/3)`);
	}
};
