const userSchema = require('../schema/user');

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

//lottery
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
