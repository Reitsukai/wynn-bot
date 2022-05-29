const captchaSchema = require('../schema/captcha');

module.exports.getCaptchaByDiscordId = async function (key) {
	return await captchaSchema.findOne({ discordId: key });
};

module.exports.updateCaptcha = async function (key, fieldUpdate) {
	return await captchaSchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};

module.exports.checkIsBlock = async function (discordId) {
	let check = await captchaSchema.find({ discordId: discordId }, { timeBlock: 1, isResolve: 1, isBlock: 1 });
	if (check.length > 0) {
		if (check[0].isBlock === true) {
			//update gỡ ban
			if (check[0].timeBlock < Date.now()) {
				await captchaSchema.updateOne(
					{ discordId: discordId },
					{
						isBlock: false
					}
				);
				return false;
			}
			return true;
		} else if (!check[0].isResolve) {
			//client die
			return check;
		}
	}
	return false;
};
