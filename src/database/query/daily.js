const dailySchema = require('../schema/daily');
//daily
module.exports.getDailyInfo = async function (key) {
	return await dailySchema.findOne({ discordId: key });
};

module.exports.setDailyInfo = async function (key, fieldUpdate) {
	return await dailySchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};
