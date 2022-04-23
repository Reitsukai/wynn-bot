const guildSchema = require('./schema/guild');
const userSchema = require('./schema/user');
const dailySchema = require('./schema/daily');
const lotteryResultSchema = require('./schema/lotteryResult');
const lotterySchema = require('./schema/lottery');
const lotteryArraySchema = require('./schema/lotteryArray');
// Create/find Guilds Database
module.exports.fetchGuild = async function (key) {
	let guildDB = await guildSchema.findOne({ id: key });

	if (guildDB) {
		return guildDB;
	} else {
		guildDB = new guildSchema({
			id: key,
			registeredAt: Date.now()
		});
		await guildDB.save().catch((err) => console.log(err));
		return guildDB;
	}
};

module.exports.updateGuild = async function (key, fieldUpdate) {
	return await guildSchema.findOneAndUpdate({ id: key }, fieldUpdate, { new: true });
};

//user
module.exports.fetchUser = async function (key) {
	let userDB = await userSchema.findOne({ discordId: key });

	if (userDB) {
		return userDB;
	} else {
		userDB = new userSchema({ discordId: key });
		await userDB.save().catch((err) => console.log(err));
		return userDB;
	}
};

module.exports.updateUser = async function (key, fieldUpdate) {
	return await userSchema.findOneAndUpdate({ discordId: key }, fieldUpdate, { new: true });
};

module.exports.checkExistUser = async function (key) {
	let userDB = await userSchema.findOne({ discordId: key });

	if (userDB) {
		return userDB;
	}
};

module.exports.transactionItemUser = async function (key1, key2, fieldUpdate1, fieldUpdate2) {
	var bulkOp = userSchema.collection.initializeUnorderedBulkOp();
	bulkOp.find({ discordId: key1 }).updateOne(fieldUpdate1);
	bulkOp.find({ discordId: key2 }).updateOne(fieldUpdate2);
	return bulkOp.execute();
};

module.exports.upsertUser = async function (key, fieldUpdate) {
	return await userSchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};

//daily
module.exports.getDailyInfo = async function (key) {
	return await dailySchema.findOne({ discordId: key });
};

module.exports.setDailyInfo = async function (key, fieldUpdate) {
	return await dailySchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};

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

module.exports.updateListWinner = async function (list, reward) {
	for (let i = 0; i < list.length; i++) {
		await userSchema.updateOne(
			{ discordId: list[i] },
			{
				$inc: {
					money: reward
				}
			}
		);
	}
};

module.exports.clearLotteryUser = async function () {
	return await lotterySchema.deleteMany({});
};
