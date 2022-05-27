const captchaSchema = require('../schema/captcha');

module.exports.getCaptchaByDiscordId = async function (key) {
	return await captchaSchema.findOne({ discordId: key });
};

module.exports.updateCaptcha = async function (key, fieldUpdate) {
	return await captchaSchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};
