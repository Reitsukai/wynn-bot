const lotteryResultSchema = require('../schema/lotteryResult');
const lotterySchema = require('../schema/lottery');
const lotteryArraySchema = require('../schema/lotteryArray');

//lottery array
module.exports.clearLotteryArray = async function () {
	return await lotteryArraySchema.deleteMany({});
};

module.exports.initLottery = async function (arrayInit, lotteryType) {
	let lotteryDB = new lotteryArraySchema({
		arrayInit: arrayInit,
		lotteryType: lotteryType
	});
	let lotteryResDB = new lotteryResultSchema({
		lotteryType: lotteryType
	});
	await lotteryResDB.save().catch((err) => console.log(err));
	return await lotteryDB.save().catch((err) => console.log(err));
};

module.exports.loadArrayLottery = async function () {
	return await lotteryArraySchema.find().sort({ _id: -1 }).limit(4);
};

module.exports.saveArrayLottery = async function (array) {
	return lotteryArraySchema.updateOne({ _id: array._id }, { arrayBackup: array.arrayBackup });
};

//lottery result
module.exports.getLotteryResult = async function () {
	return await lotteryResultSchema.find().sort({ createdAt: -1 }).limit(4);
};

module.exports.getLastResultLottery = async function () {
	return await lotteryResultSchema
		.find({ 'arrayResult.1': { $exists: true } })
		.sort({ createdAt: -1 })
		.limit(4);
};

module.exports.getLotteryResultByType = async function (lotteryType) {
	return await lotteryResultSchema.findOne({ lotteryType: lotteryType }).sort({ createdAt: -1 });
};

module.exports.updateCountLotteryResult = async function (id, count) {
	try {
		const results = await lotteryResultSchema
			.aggregate([
				{ $match: { _id: id } },
				{
					$project: {
						counter: {
							$cond: [{ $lt: ['$counter', count] }, count, { $add: ['$counter', 1] }]
						}
					}
				}
			])
			.exec();
		const data = results[0];
		const { counter } = data;
		return await lotteryResultSchema.findOneAndUpdate({ _id: id }, { $set: { counter } }, { new: true }).exec();
		// console.log(doc);
	} catch (err) {
		console.error(err);
	}
	// return await lotteryResultSchema.findOneAndUpdate({ lotteryType: lotteryType }, {});
	// ({ lotteryType: lotteryType }).sort({ createdAt: -1 });
};

module.exports.updateLotteryResult = async function (array, id) {
	return await lotteryResultSchema.updateOne({ _id: id }, { arrayResult: array });
};

//lotteryUser
module.exports.createNewLottery = async function (discordId, code) {
	let userLot = new lotterySchema({
		discordId: discordId,
		lotteryType: code.toString().length === 1 ? 2 : code.toString().length,
		code: code
	});
	return await userLot.save().catch((err) => console.log(err));
};

module.exports.getListWiner = async function (list) {
	return await lotterySchema.find({ code: { $in: list } });
};

module.exports.clearLotteryUser = async function () {
	return await lotterySchema.deleteMany({});
};

module.exports.findAllLotteryByDiscordId = async function (key) {
	return await lotterySchema.find({ discordId: key });
};
