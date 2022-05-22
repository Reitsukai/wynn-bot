const itemFishSchema = require('../schema/itemFish');

module.exports.getItemFishByDiscordId = async function (key) {
	let itemFish = await itemFishSchema.findOne({ discordId: key });
	if (itemFish) {
		return itemFish;
	} else {
		itemFish = new itemFishSchema({ discordId: key });
		await itemFish.save().catch((err) => console.log(err));
		return itemFish;
	}
};

module.exports.updateItemFish = async function (key, fieldUpdate) {
	return await itemFishSchema.updateOne({ discordId: key }, fieldUpdate, { upsert: true });
};
