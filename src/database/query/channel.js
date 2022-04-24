const channelSchema = require('../schema/channel');

module.exports.fetchChannel = async function (key) {
	let channelDB = await channelSchema.findOne({ channelId: key });
	if (channelDB) {
		return channelDB;
	} else {
		channelDB = new channelSchema({
			channelId: key
		});
		await channelDB.save().catch((err) => console.log(err));
		return channelDB;
	}
};

module.exports.updateChannel = async function (key, fieldUpdate) {
	return await channelSchema.updateOne({ channelId: key }, fieldUpdate, { new: true });
};
