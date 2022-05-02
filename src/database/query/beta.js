const betabotShema = require('../schema/betabot');

module.exports.getBetaBotInfo = async function (key) {
	return await betabotShema.findOne({ discordId: key });
};

module.exports.setBetaBotInfo = async function (key, fieldUpdate) {
	return await betabotShema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};
