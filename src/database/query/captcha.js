const captchaSchema = require('../schema/captcha');

module.exports.getCaptchaByDiscordId = async function (key) {
	return await captchaSchema.findOne({ discordId: key });
};

module.exports.updateCaptcha = async function (key, fieldUpdate) {
	return await captchaSchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};

module.exports.checkIsBlock = async function (discordId) {
	let check = await captchaSchema.find({ discordId: discordId, isBlock: true }, { _id: 1, timeBlock: 1 });
	if (check.length > 0) {
		if (check[0].timeBlock < Date.now()) {
			//update
			await captchaSchema.updateOne(
				{ discordId: discordId },
				{
					isBlock: false
				}
			);
			return false;
		}
		return true;
	}
	return false;
};
