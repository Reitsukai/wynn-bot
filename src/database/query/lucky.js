const luckSchema = require('../schema/lucky');

module.exports.addNewBetLucky = async function (discordId, moneyBet, arrayBet) {
	let luckyDB = new luckSchema({
		discordId: discordId,
		moneyBet: moneyBet,
		arrayBet: arrayBet
	});
	return await luckyDB.save().catch((err) => console.log(err));
};

module.exports.getAllBetLucky = async function () {
	const result = await luckSchema.find({});
	await luckSchema.deleteMany({});
	return result;
};

module.exports.clearBetLucky = async function () {
	return await luckSchema.deleteMany({});
};

module.exports.findAllLuckyByDiscordId = async function (key) {
	return await luckSchema.find({ discordId: key });
};
