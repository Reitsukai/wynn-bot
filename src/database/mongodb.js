const guildSchema = require('./schema/guild');
//Create/find Guilds Database
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
