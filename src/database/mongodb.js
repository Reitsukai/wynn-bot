const guildSchema = require('./schema/guild');
const userSchema = require('./schema/user');
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

module.exports.transactionItemUser = async function (key1, key2, fieldUpdate1, fieldUpdate2, value1, value2) {
	var bulkOp = userSchema.collection.initializeUnorderedBulkOp();
	bulkOp.find({ discordId: key1 }).updateOne(fieldUpdate1);
	bulkOp.find({ discordId: key2 }).updateOne(fieldUpdate2);
	return bulkOp.execute();
};
